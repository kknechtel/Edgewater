/**
 * Bankruptcy Filings API Client
 * Fetches filing data from AWS API Gateway
 */

const API_BASE_URL = 'https://tsojl7sith.execute-api.us-east-1.amazonaws.com/prod';

export interface Filing {
  id: string;
  debtorName: string;
  caseNumber: string;
  filedDate: string;
  district: string;
  chapter: string;
  assets: string;
  liabilities: string;
  creditors: string;
  location: string;
  industry: string;
  description: string;
  petitionLink?: string;
  docketLink?: string;
  topCreditors: Array<{
    name: string;
    amount: string;
    type: string;
  }>;
}

export interface FilingsResponse {
  filings: Filing[];
  count: number;
  limit: number;
  days: number;
}

export interface FilingsQueryParams {
  limit?: number;
  days?: number;
  chapter?: string;
  district?: string;
  industry?: string;
}

/**
 * Fetch bankruptcy filings from the API
 */
export async function fetchFilings(params?: FilingsQueryParams): Promise<FilingsResponse> {
  const queryParams = new URLSearchParams();
  
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.days) queryParams.append('days', params.days.toString());
  if (params?.chapter) queryParams.append('chapter', params.chapter);
  if (params?.district) queryParams.append('district', params.district);
  if (params?.industry) queryParams.append('industry', params.industry);
  
  const url = `${API_BASE_URL}/filings${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  console.log('Fetching filings from:', url);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data: FilingsResponse = await response.json();
    console.log(`Fetched ${data.count} filings`);
    
    return data;
  } catch (error) {
    console.error('Error fetching filings:', error);
    throw error;
  }
}

