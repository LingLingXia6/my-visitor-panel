const express = require('express');
const router = express.Router();
const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');
const { success, failure } = require('../utils/response');

/**
 * 获取仪表板统计数据
 * GET /dashboard/stats
 * 返回：今年访客数、本月访客数、今日访客数、本月host数
 */
router.get('/stats', async (req, res) => {
  try {
    // 定义时间范围条件
    const today = `vf.visit_time >= CURRENT_DATE() AND vf.visit_time < CURRENT_DATE() + INTERVAL 1 DAY`;
    const thisMonth = `vf.visit_time >= DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01') AND vf.visit_time < DATE_FORMAT(CURRENT_DATE() + INTERVAL 1 MONTH, '%Y-%m-01')`;
    const thisYear = `vf.visit_time >= DATE_FORMAT(CURRENT_DATE(), '%Y-01-01') AND vf.visit_time < DATE_FORMAT(CURRENT_DATE() + INTERVAL 1 YEAR, '%Y-01-01')`;
    
    // 1. 今年访客数
    const yearlyVisitorsQuery = `SELECT COUNT(DISTINCT fhv.visitor_id) AS count FROM FormHostVisitors fhv JOIN VisitorsForms vf ON fhv.VisitorsFormId = vf.id WHERE ${thisYear}`;
    
    // 2. 本月访客数
    const monthlyVisitorsQuery = `SELECT COUNT(DISTINCT fhv.visitor_id) AS count FROM FormHostVisitors fhv JOIN VisitorsForms vf ON fhv.VisitorsFormId = vf.id WHERE ${thisMonth}`;
    
    // 3. 今日访客数
    const dailyVisitorsQuery = `SELECT COUNT(DISTINCT fhv.visitor_id) AS count FROM FormHostVisitors fhv JOIN VisitorsForms vf ON fhv.VisitorsFormId = vf.id WHERE ${today}`;
    
    // 4. 本月host数据
    const monthlyHostsQuery = `SELECT COUNT(DISTINCT fhv.host_id) AS count FROM FormHostVisitors fhv JOIN VisitorsForms vf ON fhv.VisitorsFormId = vf.id WHERE ${thisMonth}`;
    
    // 并行执行所有查询
    const [yearlyResult, monthlyResult, dailyResult, hostsResult] = await Promise.all([
      sequelize.query(yearlyVisitorsQuery, { type: QueryTypes.SELECT }),
      sequelize.query(monthlyVisitorsQuery, { type: QueryTypes.SELECT }),
      sequelize.query(dailyVisitorsQuery, { type: QueryTypes.SELECT }),
      sequelize.query(monthlyHostsQuery, { type: QueryTypes.SELECT })
    ]);
    
    // 构造返回数据
    const stats = {
      yearlyVisitors: yearlyResult[0]?.count || 0,
      monthlyVisitors: monthlyResult[0]?.count || 0,
      dailyVisitors: dailyResult[0]?.count || 0,
      monthlyHosts: hostsResult[0]?.count || 0
    };
    
    return success(res, '统计数据获取成功', stats);
    
  } catch (error) {
    console.error('获取仪表板统计数据失败:', error);
    return failure(res, error);
  }
});

/**
 * 获取访客趋势数据
 * GET /dashboard/trends
 * 查询参数：
 * - period: 时间范围 (7days, 30days, 12months)
 * - granularity: 时间粒度 (daily, weekly, monthly)
 */
router.get('/trends', async (req, res) => {
  try {
    const { period = '7days', granularity = 'daily' } = req.query;
    
    // 验证参数
    const validPeriods = ['7days', '30days', '12months'];
    const validGranularities = ['daily', 'weekly', 'monthly'];
    
    if (!validPeriods.includes(period)) {
      return failure(res, '无效的时间范围参数，支持: 7days, 30days, 12months');
    }
    
    if (!validGranularities.includes(granularity)) {
      return failure(res, '无效的时间粒度参数，支持: daily, weekly, monthly');
    }
    
    let dateFormat, dateRange, groupBy;
    
    // 根据时间粒度设置日期格式和分组
    switch (granularity) {
      case 'daily':
        dateFormat = '%Y-%m-%d';
        groupBy = 'DATE(vf.visit_time)';
        break;
      case 'weekly':
        dateFormat = '%Y-%u';
        groupBy = 'YEARWEEK(vf.visit_time, 1)';
        break;
      case 'monthly':
        dateFormat = '%Y-%m';
        groupBy = 'DATE_FORMAT(vf.visit_time, "%Y-%m")';
        break;
    }
    
    // 根据时间范围设置日期条件
    switch (period) {
      case '7days':
        dateRange = 'vf.visit_time >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)';
        break;
      case '30days':
        dateRange = 'vf.visit_time >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)';
        break;
      case '12months':
        dateRange = 'vf.visit_time >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)';
        break;
    }
    
    // 构建查询SQL
    const trendsQuery = `
      SELECT 
        DATE_FORMAT(vf.visit_time, '${dateFormat}') as period,
        COUNT(DISTINCT fhv.visitor_id) as visitor_count,
        COUNT(fhv.visitor_id) as visit_count
      FROM VisitorsForms vf
      JOIN FormHostVisitors fhv ON vf.id = fhv.VisitorsFormId
      WHERE ${dateRange}
      GROUP BY DATE_FORMAT(vf.visit_time, '${dateFormat}')
      ORDER BY DATE_FORMAT(vf.visit_time, '${dateFormat}') ASC
    `;
    
    // 执行查询
    const trendsResult = await sequelize.query(trendsQuery, { type: QueryTypes.SELECT });
    
    // 生成完整的时间序列数据（填充缺失的时间点）
    const completeData = generateCompleteTimeSeries(trendsResult, period, granularity);
    
    return success(res, '趋势数据获取成功', {
      period,
      granularity,
      data: completeData
    });
    
  } catch (error) {
    console.error('获取趋势数据失败:', error);
    return failure(res, error);
  }
});

/**
 * 生成完整的时间序列数据，填充缺失的时间点
 */
function generateCompleteTimeSeries(data, period, granularity) {
  const result = [];
  const dataMap = new Map();
  
  // 将查询结果转换为Map便于查找
  data.forEach(item => {
    dataMap.set(item.period, {
      visitor_count: item.visitor_count,
      visit_count: item.visit_count
    });
  });
  
  const now = new Date();
  let current = new Date();
  let periods = 0;
  
  // 根据period和granularity确定时间范围和步长
  switch (period) {
    case '7days':
      current.setDate(now.getDate() - 6);
      periods = 7;
      break;
    case '30days':
      current.setDate(now.getDate() - 29);
      periods = 30;
      break;
    case '12months':
      current.setMonth(now.getMonth() - 11);
      periods = 12;
      break;
  }
  
  // 生成完整的时间序列
  for (let i = 0; i < periods; i++) {
    let periodKey;
    
    switch (granularity) {
      case 'daily':
        periodKey = current.toISOString().split('T')[0];
        current.setDate(current.getDate() + 1);
        break;
      case 'weekly':
        const year = current.getFullYear();
        const week = getWeekNumber(current);
        periodKey = `${year}-${week.toString().padStart(2, '0')}`;
        current.setDate(current.getDate() + 7);
        break;
      case 'monthly':
        periodKey = `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}`;
        current.setMonth(current.getMonth() + 1);
        break;
    }
    
    const periodData = dataMap.get(periodKey) || { visitor_count: 0, visit_count: 0 };
    result.push({
      period: periodKey,
      visitor_count: periodData.visitor_count,
      visit_count: periodData.visit_count
    });
  }
  
  return result;
}

/**
 * 获取ISO周数
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * 获取排名前10的访客信息
 * GET /dashboard/top-visitors
 * 返回：访客ID、姓名、公司、电话、表单数量
 */
router.get('/top-visitors', async (req, res) => {
  try {
    const topVisitorsQuery = `
      SELECT 
        fhv.visitor_id, 
        v.name, 
        v.company, 
        v.phone, 
        COUNT(DISTINCT fhv.VisitorsFormId) AS form_count 
      FROM 
        FormHostVisitors fhv 
      JOIN 
        Visitors v ON fhv.visitor_id = v.id 
      GROUP BY 
        fhv.visitor_id, v.name, v.company, v.phone 
      ORDER BY 
        form_count DESC 
      LIMIT 10
    `;
    
    // 执行查询
    const topVisitorsResult = await sequelize.query(topVisitorsQuery, { type: QueryTypes.SELECT });
    
    return success(res, '排名前10访客数据获取成功', topVisitorsResult);
    
  } catch (error) {
    console.error('获取排名前10访客数据失败:', error);
    return failure(res, error);
  }
});

module.exports = router;