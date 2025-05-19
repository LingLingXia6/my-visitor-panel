import { useState, useEffect } from 'react';
 const useGetData = (fetchFun) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [status,setStatus]=useState(false);
  const fetchData = async () => {
    setLoading(true);
    const fetchInfo=  await fetchFun();
    if (fetchInfo.status) {
      setData(fetchInfo?.data||[]);
      setLoading(false);
      setStatus(true);
    } else {
      setError(true);
      setLoading(false);
      setStatus(false);
    }
  }
  useEffect(() => {
    fetchData();
  },[])
  return {
    data,
    loading,
    error,
    status
  }
}
export default useGetData;