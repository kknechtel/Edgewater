import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import FilingCard from './FilingCard';
import FilingsTable from './FilingsTable';
import { ArrowLeft, Search, ChevronDown, ChevronUp, TrendingUp, TrendingDown, LayoutGrid, Table as TableIcon } from 'lucide-react';
import { formatCurrency, formatNumber, formatLargeNumber } from '../utils/formatting';
import { fetchFilings, type Filing as APIFiling } from '../utils/api/filings';

interface Filing {
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
  topCreditors: Array<{
    name: string;
    amount: string;
    type: string;
  }>;
}

interface DashboardProps {
  onNavigateToLanding: () => void;
  onViewFiling: (filing: Filing) => void;
  session?: any;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
}

export default function Dashboard({ onNavigateToLanding, onViewFiling, session, searchTerm: externalSearchTerm = '', onSearchChange }: DashboardProps) {
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  
  // Use external search term if provided, otherwise use internal
  const searchTerm = onSearchChange ? externalSearchTerm : internalSearchTerm;
  const setSearchTerm = onSearchChange || setInternalSearchTerm;
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedLiabilityRange, setSelectedLiabilityRange] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [groupBy, setGroupBy] = useState<'date' | 'liability'>('date');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  
  // API data state
  const [filings, setFilings] = useState<Filing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch filings from API on mount
  useEffect(() => {
    async function loadFilings() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetchFilings({ limit: 100, days: 90 });
        setFilings(response.filings);
      } catch (err) {
        console.error('Failed to load filings:', err);
        setError('Failed to load bankruptcy filings. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadFilings();
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#385854] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading bankruptcy filings...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Filings</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Old mock data removed - using real API data now
  const mockFilings = [
    {
      id: '1',
      debtorName: 'Covenant Baptist Church And Ministries',
      caseNumber: '25-60026',
      filedDate: 'Sep 2, 2025',
      district: 'N.D. Georgia',
      chapter: 'Chapter 11',
      assets: '$1M-$10M',
      liabilities: '$1M-$10M',
      creditors: '1-49',
      location: 'Decatur, GA',
      industry: 'Religious Organization',
      description: 'Religious organization with significant real estate holdings seeking reorganization. Primary asset is church property valued at $2,600,000. Pending litigation with largest creditor EXIGO Management.',
      topCreditors: [
        { name: 'EXIGO Management, LLC', amount: '$2,509,125', type: 'Secured' },
        { name: 'PrinsBank', amount: '$110,200', type: 'Secured' },
        { name: 'US Small Business Admin', amount: '$102,000', type: 'Secured' }
      ]
    },
    {
      id: '2',
      debtorName: 'TechStartup Solutions Inc.',
      caseNumber: '25-60027',
      filedDate: 'Sep 4, 2025',
      district: 'N.D. California',
      chapter: 'Chapter 7',
      assets: '$100K-$500K',
      liabilities: '$1M-$10M',
      creditors: '50-99',
      location: 'San Francisco, CA',
      industry: 'Technology',
      description: 'Failed B2B SaaS platform seeking liquidation after 3 years of operations. Unable to secure Series A funding despite $3,200,000 in seed capital. Primary creditors include Silicon Valley Bank and unpaid vendors.',
      topCreditors: [
        { name: 'Silicon Valley Bank', amount: '$1,250,000', type: 'Secured' },
        { name: 'AWS Services', amount: '$387,450', type: 'Unsecured' },
        { name: 'WeWork', amount: '$225,000', type: 'Unsecured' }
      ]
    },
    {
      id: '3',
      debtorName: 'Midwest Manufacturing LLC',
      caseNumber: '25-60028',
      filedDate: 'Sep 4, 2025',
      district: 'E.D. Michigan',
      chapter: 'Chapter 11',
      assets: '$1M-$10M',
      liabilities: '$10M-$50M',
      creditors: '100-199',
      location: 'Detroit, MI',
      industry: 'Manufacturing',
      description: 'Auto parts manufacturer seeking reorganization after supply chain disruptions and declining OEM orders. Operating 2 facilities with 150 employees. Attempting to restructure $12,300,000 in debt while maintaining operations.',
      topCreditors: [
        { name: 'Fifth Third Bank', amount: '$4,500,000', type: 'Secured' },
        { name: 'Steel Suppliers Inc', amount: '$1,275,000', type: 'Unsecured' },
        { name: 'Equipment Finance Corp', amount: '$987,500', type: 'Secured' }
      ]
    },
    {
      id: '4',
      debtorName: 'Retail Fashion Group Inc.',
      caseNumber: '25-60025',
      filedDate: 'Sep 3, 2025',
      district: 'S.D. New York',
      chapter: 'Chapter 11',
      assets: '$100M-$500M',
      liabilities: '$100M-$500M',
      creditors: '500+',
      location: 'New York, NY',
      industry: 'Retail',
      description: 'National retail chain with 127 stores across 23 states filing for Chapter 11 reorganization. Plans to close 40 underperforming locations and renegotiate mall leases. Secured $50,000,000 DIP financing from existing lenders.',
      topCreditors: [
        { name: 'JP Morgan Chase', amount: '$75,000,000', type: 'Secured' },
        { name: 'General Electric Capital', amount: '$45,000,000', type: 'Secured' },
        { name: 'Landlord Group LLC', amount: '$25,000,000', type: 'Unsecured' }
      ]
    }
  ];

  const filteredFilings = filings.filter(filing => {
    const matchesSearch = filing.debtorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         filing.caseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesChapter = selectedChapter === 'all' || filing.chapter === selectedChapter;
    const matchesDistrict = selectedDistrict === 'all' || filing.district === selectedDistrict;
    const matchesLiabilityRange = selectedLiabilityRange === 'all' || filing.liabilities === selectedLiabilityRange;
    const matchesIndustry = selectedIndustry === 'all' || filing.industry === selectedIndustry;
    
    return matchesSearch && matchesChapter && matchesDistrict && matchesLiabilityRange && matchesIndustry;
  });

  const activeFiltersCount = [selectedChapter, selectedDistrict, selectedLiabilityRange, selectedIndustry].filter(v => v !== 'all').length;

  // Calculate time-based filing counts with trends
  const today = new Date();
  const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  // Mock data - in real app would filter by actual dates and compare to previous periods
  const todayFilings = filings.filter(f => f.filedDate.includes('Sep 4')).length;
  const yesterdayFilings = 1; // Mock: previous day count
  const todayChange = ((todayFilings - yesterdayFilings) / yesterdayFilings * 100).toFixed(0);
  
  const thisWeekFilings = filings.filter(f => f.filedDate.includes('Sep')).length;
  const lastWeekFilings = 3; // Mock: previous week count
  const weekChange = ((thisWeekFilings - lastWeekFilings) / lastWeekFilings * 100).toFixed(0);
  
  const thisMonthFilings = filings.length;
  const lastMonthFilings = 3; // Mock: previous month count
  const monthChange = ((thisMonthFilings - lastMonthFilings) / lastMonthFilings * 100).toFixed(0);

  return (
    <div>
      {/* Main Content */}
      <main className="px-6 py-8">
        {/* Time-based Metrics */}
        <div className="flex justify-center gap-6 mb-8 pt-2">
          <div className="bg-white rounded-xl border border-gray-200 px-8 py-6 min-w-[180px] hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-2">Today</div>
              <div className="text-4xl font-bold text-[#385854] mb-2">{todayFilings}</div>
              <div className={`flex items-center justify-center gap-1 text-sm ${
                parseFloat(todayChange) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {parseFloat(todayChange) >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{Math.abs(parseFloat(todayChange))}% vs yesterday</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 px-8 py-6 min-w-[180px] hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-2">This Week</div>
              <div className="text-4xl font-bold text-[#385854] mb-2">{thisWeekFilings}</div>
              <div className={`flex items-center justify-center gap-1 text-sm ${
                parseFloat(weekChange) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {parseFloat(weekChange) >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{Math.abs(parseFloat(weekChange))}% vs last week</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 px-8 py-6 min-w-[180px] hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-2">This Month</div>
              <div className="text-4xl font-bold text-[#385854] mb-2">{thisMonthFilings}</div>
              <div className={`flex items-center justify-center gap-1 text-sm ${
                parseFloat(monthChange) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {parseFloat(monthChange) >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{Math.abs(parseFloat(monthChange))}% vs last month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 bg-white rounded-xl p-4">
          <button 
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors relative"
          >
            <Search className="w-5 h-5 mr-2" />
            <span className="font-medium">Filters</span>
            {filtersOpen ? (
              <ChevronUp className="w-4 h-4 ml-2" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-2" />
            )}
            {activeFiltersCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
          
          {filtersOpen && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Select value={selectedChapter} onValueChange={setSelectedChapter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Chapters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Chapters</SelectItem>
                  <SelectItem value="Chapter 7">Chapter 7</SelectItem>
                  <SelectItem value="Chapter 11">Chapter 11</SelectItem>
                  <SelectItem value="Chapter 13">Chapter 13</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger>
                  <SelectValue placeholder="All Districts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  <SelectItem value="N.D. Georgia">N.D. Georgia</SelectItem>
                  <SelectItem value="S.D. New York">S.D. New York</SelectItem>
                  <SelectItem value="N.D. California">N.D. California</SelectItem>
                  <SelectItem value="E.D. Michigan">E.D. Michigan</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedLiabilityRange} onValueChange={setSelectedLiabilityRange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Liabilities Ranges" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Liabilities Ranges</SelectItem>
                  <SelectItem value="Under $50K">Under $50K</SelectItem>
                  <SelectItem value="$50K - $500K">$50K - $500K</SelectItem>
                  <SelectItem value="$500K - $1M">$500K - $1M</SelectItem>
                  <SelectItem value="$1M - $10M">$1M - $10M</SelectItem>
                  <SelectItem value="$10M - $50M">$10M - $50M</SelectItem>
                  <SelectItem value="Over $50M">Over $50M</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="All Industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Religious Organization">Religious Organization</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Real Estate">Real Estate</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="default"
                className="bg-primary hover:bg-primary/90"
              >
                Apply
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedChapter('all');
                  setSelectedDistrict('all');
                  setSelectedLiabilityRange('all');
                  setSelectedIndustry('all');
                }}
              >
                Clear
              </Button>
            </div>
          )}
        </div>

        {/* Filings List */}
        <div className="bg-white rounded-t-xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-bold">Recent Filings</h2>
                <p className="text-sm text-gray-500">
                  {filteredFilings.length} filing{filteredFilings.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <div className="flex items-center gap-6">
                {/* View Mode Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">View:</span>
                  <div className="flex rounded-lg border border-gray-300">
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                        viewMode === 'cards'
                          ? 'bg-[#385854] text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      } rounded-l-lg`}
                    >
                      <LayoutGrid className="h-4 w-4" />
                      Cards
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                        viewMode === 'table'
                          ? 'bg-[#385854] text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      } rounded-r-lg border-l border-gray-300`}
                    >
                      <TableIcon className="h-4 w-4" />
                      Table
                    </button>
                  </div>
                </div>

                {/* Group By Toggle - Only for cards view */}
                {viewMode === 'cards' && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Group by:</span>
                    <div className="flex rounded-lg border border-gray-300">
                      <button
                        onClick={() => setGroupBy('date')}
                        className={`px-4 py-2 text-sm transition-colors ${
                          groupBy === 'date'
                            ? 'bg-[#385854] text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        } rounded-l-lg`}
                      >
                        Date
                      </button>
                      <button
                        onClick={() => setGroupBy('liability')}
                        className={`px-4 py-2 text-sm transition-colors ${
                          groupBy === 'liability'
                            ? 'bg-[#385854] text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        } rounded-r-lg border-l border-gray-300`}
                      >
                        Liabilities
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Table View or Card View */}
            {viewMode === 'table' ? (
              <FilingsTable filings={filteredFilings} onViewDetail={onViewFiling} session={session} />
            ) : (
              /* Group filings by date or liability */
              (() => {
                if (groupBy === 'date') {
                // Group by filing date
                const groupedByDate: { [key: string]: Filing[] } = {};
                filteredFilings.forEach(filing => {
                  const date = filing.filedDate;
                  if (!groupedByDate[date]) {
                    groupedByDate[date] = [];
                  }
                  groupedByDate[date].push(filing);
                });

                // Sort dates in descending order (most recent first)
                const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
                  // Simple date comparison - in production would use proper date parsing
                  return b.localeCompare(a);
                });

                return (
                  <div className="space-y-8">
                    {sortedDates.map((date) => (
                      <div key={date}>
                        <div className="flex items-center mb-4">
                          <h3 className="font-semibold">{date}</h3>
                          <Badge variant="outline" className="ml-3">
                            {groupedByDate[date].length} filing{groupedByDate[date].length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {groupedByDate[date].map((filing) => (
                            <FilingCard key={filing.id} filing={filing} onViewDetail={onViewFiling} session={session} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              } else {
                // Group by liability size
                const groupedFilings = {
                  large: filteredFilings.filter(f => f.liabilities.includes('$100M') || f.liabilities.includes('$50M')),
                  medium: filteredFilings.filter(f => f.liabilities.includes('$10M') && !f.liabilities.includes('$100M')),
                  small: filteredFilings.filter(f => f.liabilities.includes('$1M') && !f.liabilities.includes('$10M')),
                  other: filteredFilings.filter(f => !f.liabilities.includes('$1M') && !f.liabilities.includes('$10M') && !f.liabilities.includes('$100M'))
                };

                return (
                  <div className="space-y-8">
                    {/* Large Liability Cases */}
                    {groupedFilings.large.length > 0 && (
                      <div>
                        <div className="flex items-center mb-4">
                          <h3 className="font-semibold">Large Cases ($50M+ Liabilities)</h3>
                          <Badge variant="destructive" className="ml-3">
                            {groupedFilings.large.length} filing{groupedFilings.large.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {groupedFilings.large.map((filing) => (
                            <FilingCard key={filing.id} filing={filing} onViewDetail={onViewFiling} session={session} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Medium Liability Cases */}
                    {groupedFilings.medium.length > 0 && (
                      <div>
                        <div className="flex items-center mb-4">
                          <h3 className="font-semibold">Medium Cases ($1M-$50M Liabilities)</h3>
                          <Badge variant="secondary" className="ml-3">
                            {groupedFilings.medium.length} filing{groupedFilings.medium.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {groupedFilings.medium.map((filing) => (
                            <FilingCard key={filing.id} filing={filing} onViewDetail={onViewFiling} session={session} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Small Liability Cases */}
                    {groupedFilings.small.length > 0 && (
                      <div>
                        <div className="flex items-center mb-4">
                          <h3 className="font-semibold">Small Cases (Under $1M Liabilities)</h3>
                          <Badge variant="outline" className="ml-3">
                            {groupedFilings.small.length} filing{groupedFilings.small.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {groupedFilings.small.map((filing) => (
                            <FilingCard key={filing.id} filing={filing} onViewDetail={onViewFiling} session={session} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Other Cases */}
                    {groupedFilings.other.length > 0 && (
                      <div>
                        <div className="flex items-center mb-4">
                          <h3 className="font-semibold">Other Cases</h3>
                          <Badge variant="outline" className="ml-3">
                            {groupedFilings.other.length} filing{groupedFilings.other.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {groupedFilings.other.map((filing) => (
                            <FilingCard key={filing.id} filing={filing} onViewDetail={onViewFiling} session={session} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
                }
              })()
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
