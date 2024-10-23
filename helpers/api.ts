type Quarter = {
  "quarter": string,
  "qyy": string,
  "name": string,
  "category": string,
  "academicYear": string,
  "firstDayOfClasses": string,
  "lastDayOfClasses": string,
  "firstDayOfFinals": string,
  "lastDayOfFinals": string,
  "firstDayOfQuarter": string,
  "lastDayOfSchedule": string,
  "pass1Begin": string,
  "pass2Begin": string,
  "pass3Begin": string,
  "feeDeadline": string,
  "lastDayToAddUnderGrad": string,
  "lastDayToAddGrad": string,
  "lastDayThirdWeek": string
};

export async function getQuarter(): Quarter {
  const url = 'https://api-transformer.onrender.com//https://api.ucsb.edu/academics/quartercalendar/v1/quarters/current';
  const headers = {
    'accept': 'application/json',
    'ucsb-api-version': '1.0',
    'ucsb-api-key': '1M1qsvRB65v5n0CR9ihHJCsEJF2lCvZe'
  };

  try {
    const response = await fetch(url, { method: 'GET', headers: { headers: JSON.stringify(headers) } });
    if (!response.ok) {
      throw new Error('Failed to fetch quarter info');
    }
    const data: Quarter = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};
