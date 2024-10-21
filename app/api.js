export const getQuarter = async () => {
  const url = 'https://api.ucsb.edu/academics/quartercalendar/v1/quarters/current';
  const headers = {
    'accept': 'application/json',
    'ucsb-api-version': '1.0',
    'ucsb-api-key': '1M1qsvRB65v5n0CR9ihHJCsEJF2lCvZe'
  };

  try {
    const response = await fetch(url, { method: 'GET', headers });
    if (!response.ok) {
      throw new Error('Failed to fetch quarter info');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};
