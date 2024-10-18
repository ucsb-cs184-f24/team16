// src/api.ts
export const getQuarter = async () => {
  const API_URL = 'https://api.ucsb.edu/academics/quartercalendar/v1/quarters/current';
  const API_KEY = '1M1qsvRB65v5n0CR9ihHJCsEJF2lCvZe';

  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'ucsb-api-version': '1.0',
        'ucsb-api-key': API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('getQuarter response:', data);
    return data; // Return the fetched data
  } catch (error) {
    console.error('getQuarter failed:', error);
    throw error; // Re-throw the error for handling in other parts of the app
  }
};
