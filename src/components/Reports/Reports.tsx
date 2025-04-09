import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './Reports.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Scale {
  id: number;
  activityName: string;
  date: string;
  status: 'active' | 'cancelled';
  team: {
    id: number;
    name: string;
    role: string;
    payment: number;
  }[];
}

interface MemberDetails {
  name: string;
  role: string;
  activities: {
    amanhecer: number;
    nascerDoSol: number;
    manhaLazer: number;
    remadaDog: number;
    noturnaLuaCheia: number;
    porDoSol: number;
  };
  total: number;
  percentage: number;
}

const activityMapping: { [key: string]: keyof MemberDetails['activities'] } = {
  'Amanhecer': 'amanhecer',
  'Nascer do Sol': 'nascerDoSol',
  'Manhã de Lazer': 'manhaLazer',
  'Remada Dog': 'remadaDog',
  'Remada Dog (Canceladas)': 'remadaDog',
  'Noturna/Lua Cheia': 'noturnaLuaCheia',
  'Pôr do Sol': 'porDoSol'
} as const;

const Reports: React.FC = () => {
  const [expandedRow, setExpandedRow] = useState<string>('');
  const [cancelledCount, setCancelledCount] = useState(0);
  const [totalActivities, setTotalActivities] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [activeMembers, setActiveMembers] = useState(0);
  const [memberDetails, setMemberDetails] = useState<MemberDetails[]>([]);
  const [memberActivities, setMemberActivities] = useState<{ [key: string]: { count: number; tasks: string[] } }>({});

  const toggleRow = (name: string) => {
    setExpandedRow(currentExpanded => currentExpanded === name ? '' : name);
  };

  const calculateActiveRate = () => {
    if (totalActivities === 0) return '0%';
    const rate = (activeCount / totalActivities) * 100;
    return `${Math.round(rate)}%`;
  };

  const calculateCancellationRate = () => {
    if (totalActivities === 0) return '0%';
    const rate = (cancelledCount / totalActivities) * 100;
    return `${Math.round(rate)}%`;
  };

  useEffect(() => {
    // Inside useEffect, fix the processData function structure
    const processData = () => {
      const scales: Scale[] = JSON.parse(localStorage.getItem('scales') || '[]');
      const teamMembers = JSON.parse(localStorage.getItem('teamMembers') || '[]');
      
      // Update counts
      const cancelledScales = scales.filter((scale) => scale.status === 'cancelled');
      const activeScales = scales.filter((scale) => scale.status !== 'cancelled');
      
      setCancelledCount(cancelledScales.length);
      setTotalActivities(scales.length);
      setActiveCount(activeScales.length);
      setActiveMembers(teamMembers.length);
      
      // Process member details and activities
      const memberStats: { [key: string]: MemberDetails } = {};
      const newMemberActivities: { [key: string]: { count: number; tasks: string[]; role: string } } = {};
      
      // Initialize member stats
      teamMembers.forEach((member: { name: string; role: string }) => {
        newMemberActivities[member.name] = { count: 0, tasks: [], role: member.role };
        memberStats[member.name] = {
          name: member.name,
          role: member.role,
          activities: {
            amanhecer: 0,
            nascerDoSol: 0,
            manhaLazer: 0,
            remadaDog: 0,
            noturnaLuaCheia: 0,
            porDoSol: 0
          },
          total: 0,
          percentage: 0
        };
      });
    
      // Process scales
      let activitiesCount = 0; // Add this line to track activities count
      scales.forEach((scale) => {
        if (scale.status === 'active' || scale.status === 'cancelled') {
          scale.team.forEach((member) => {
            if (memberStats[member.name]) {
              if (scale.status === 'active') {
                memberStats[member.name].total++;
                activitiesCount++; // Use the local variable instead
              }
              
              // Track the activity in memberActivities regardless of status
              if (!newMemberActivities[member.name].tasks.includes(scale.activityName)) {
                newMemberActivities[member.name].tasks.push(scale.activityName);
              }
              newMemberActivities[member.name].count++;
    
              // Update activity counts for active scales only
              if (scale.status === 'active') {
                const activityKey = activityMapping[scale.activityName as keyof typeof activityMapping];
                if (activityKey && memberStats[member.name].activities.hasOwnProperty(activityKey)) {
                  memberStats[member.name].activities[activityKey]++;
                }
              }
            }
          });
        }
      });
      
      // Calculate percentages based only on active scales
      Object.values(memberStats).forEach(member => {
        member.percentage = activitiesCount > 0  // Use activitiesCount here
          ? Math.round((member.total / activitiesCount) * 100) 
          : 0;
      });
    
      const sortedMembers = Object.values(memberStats).sort((a, b) => b.percentage - a.percentage);
      setMemberDetails(sortedMembers);
      setMemberActivities(newMemberActivities);
    
      // Process monthly data
      const monthlyData: { [key: string]: { [key: string]: number } } = {};
      const uniqueActivities: string[] = scales
        .map(scale => scale.activityName)
        .filter((value, index, self) => self.indexOf(value) === index);
      
      scales.forEach((scale) => {
        const date = new Date(scale.date);
        const currentMonth = new Date().getMonth();
        
        // Only process current month's data
        if (date.getMonth() === currentMonth) {
          const month = date.toLocaleString('pt-BR', { month: 'long' });
          
          if (!monthlyData[month]) {
            monthlyData[month] = {};
          }
          
          if (!monthlyData[month][scale.activityName]) {
            monthlyData[month][scale.activityName] = 0;
          }
          
          if (scale.status === 'active') {
            monthlyData[month][scale.activityName]++;
          }
        }
      });

      const currentMonth = new Date().toLocaleString('pt-BR', { month: 'long' });
      
      const datasets = uniqueActivities.map((activityName, index) => ({
        label: activityName,
        data: [monthlyData[currentMonth]?.[activityName] || 0],
        backgroundColor: activityName === 'Nascer do Sol'
          ? `hsla(47, 95%, 60%, 0.7)`
          : activityName === 'Remada Dog'
          ? `hsla(120, 70.20%, 50.00%, 0.29)`
          : `hsl(${(index * 360) / uniqueActivities.length}, 70%, 50%)`,
        borderColor: activityName === 'Nascer do Sol'
          ? `hsla(47, 95%, 60%, 0.9)`
          : activityName === 'Remada Dog'
          ? `hsla(120, 70.20%, 50.00%, 0.19)`
          : `hsl(${(index * 360) / uniqueActivities.length}, 70%, 50%)`,
        borderWidth: 1,
        borderRadius: 5,
        barPercentage: 0.8,
        categoryPercentage: 0.9
      }));

      setChartData({
        labels: [currentMonth],
        datasets
      });
    };
  
    // Initial load
    processData();
  
    // Add storage event listener
    const handleStorageChange = () => {
      processData();
    };
  
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Empty dependency array

  interface ChartDataset {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    borderRadius: number;
    barPercentage: number;
    categoryPercentage: number;
  }
  
  interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
  }
  
  // Add the state declaration with other useState declarations
  const [chartData, setChartData] = useState<ChartData | null>(null);

  return ( 
    <>
      <div className="reports-container">
        <div className="dashboard-header">
          <h2>Relatórios</h2>
          <div className="date-filter">
            <select defaultValue="month">
              <option value="week">Esta Semana</option>
              <option value="month">Este Mês</option>
              <option value="year">Este Ano</option>
            </select>
          </div>
        </div>
    
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Total de Atividades</h3>
            <div className="card-content">
              <span className="card-number">{activeCount}</span>
              <span className="card-trend positive">{calculateActiveRate()}</span>
            </div>
          </div>
    
          <div className="dashboard-card">
            <h3>Membros Ativos</h3>
            <div className="card-content">
              <span className="card-number">{activeMembers}</span>
              <span className="card-trend positive">Total de Membros</span>
            </div>
          </div>
    
          <div className="dashboard-card">
            <h3>Cancelamentos</h3>
            <div className="card-content">
              <span className="card-number">{cancelledCount}</span>
              <span className="card-trend negative">{calculateCancellationRate()}</span>
            </div>
          </div>
    
          <div className="dashboard-card">
            <h3>Taxa de Conclusão</h3>
            <div className="card-content">
              <span className="card-number">92%</span>
              <span className="card-trend positive">+5%</span>
            </div>
          </div>
        </div>
    
        <div className="charts-section">
          <div className="chart-container atividadesMes">
            <h3>Atividades</h3>
            <div className="chart-data-container">
              <div className="chart-canvas">
                {chartData && (
                  <Bar
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: true,
                          text: 'Distribuição de Atividades por Mês'
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `${context.dataset.label}: ${context.parsed.y}`;
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            stepSize: 1
                          }
                        }
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="chart-container custoAtividades">
            <h3>Custos por atividade</h3>
            <table>
              <thead>
                <tr>
                  <th>Atividade</th>
                  <th>Líder</th>
                  <th>Normal</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {chartData?.datasets.map((dataset) => {
                  const scales = JSON.parse(localStorage.getItem('scales') || '[]') as Scale[];
                  const activeScales = scales.filter(scale => 
                    scale.status === 'active' && 
                    scale.activityName === dataset.label
                  );

                  const leaderCost = activeScales.reduce((sum, scale) => 
                    sum + scale.team
                      .filter(member => member.role === 'leader')
                      .reduce((total, member) => total + member.payment, 0), 0
                  );

                  const normalCost = activeScales.reduce((sum, scale) => 
                    sum + scale.team
                      .filter(member => member.role !== 'leader')
                      .reduce((total, member) => total + member.payment, 0), 0
                  );

                  return (
                    <tr key={dataset.label}>
                      <td>{dataset.label}</td>
                      <td>R$ {leaderCost.toFixed(2)}</td>
                      <td>R$ {normalCost.toFixed(2)}</td>
                      <td>R$ {(leaderCost + normalCost).toFixed(2)}</td>
                    </tr>
                  );
                })}
                {chartData && (
                  <tr className="total-row">
                    <td><strong>Total</strong></td>
                    <td>
                      <strong>
                        R$ {chartData.datasets.reduce((sum, dataset) => {
                          const scales = JSON.parse(localStorage.getItem('scales') || '[]') as Scale[];
                          const activeScales = scales.filter(scale => 
                            scale.status === 'active' && 
                            scale.activityName === dataset.label
                          );
                          return sum + activeScales.reduce((total, scale) => 
                            total + scale.team
                              .filter(member => member.role === 'leader')
                              .reduce((memberTotal, member) => memberTotal + member.payment, 0), 0
                          );
                        }, 0).toFixed(2)}
                      </strong>
                    </td>
                    <td>
                      <strong>
                        R$ {chartData.datasets.reduce((sum, dataset) => {
                          const scales = JSON.parse(localStorage.getItem('scales') || '[]') as Scale[];
                          const activeScales = scales.filter(scale => 
                            scale.status === 'active' && 
                            scale.activityName === dataset.label
                          );
                          return sum + activeScales.reduce((total, scale) => 
                            total + scale.team
                              .filter(member => member.role !== 'leader')
                              .reduce((memberTotal, member) => memberTotal + member.payment, 0), 0
                          );
                        }, 0).toFixed(2)}
                      </strong>
                    </td>
                    <td>
                      <strong>
                        R$ {chartData.datasets.reduce((sum, dataset) => {
                          const scales = JSON.parse(localStorage.getItem('scales') || '[]') as Scale[];
                          const activeScales = scales.filter(scale => 
                            scale.status === 'active' && 
                            scale.activityName === dataset.label
                          );
                          return sum + activeScales.reduce((total, scale) => 
                            total + scale.team.reduce((memberTotal, member) => memberTotal + member.payment, 0), 0
                          );
                        }, 0).toFixed(2)}
                      </strong>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="chart-container">
            <h3>Quadro de Escalas</h3>
            <table>
              <thead>
                <tr>
                  <th>Colaborador</th>
                  <th>Total</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {memberDetails.map((member) => (
                  <React.Fragment key={member.name}>
                    <tr className={expandedRow === member.name ? 'expanded' : ''}>
                      <td>
                        <button 
                          onClick={() => toggleRow(member.name)}
                          className="member-button"
                        >
                          {member.name}
                          <small style={{ display: 'block', color: '#666' }}>
                            {member.role === 'leader' ? 'Líder' : ''}
                          </small>
                        </button>
                      </td>
                      <td>{member.total}</td>
                      <td>{member.percentage}%</td>
                    </tr>
                    {expandedRow === member.name && (
                      <tr className="details-row">
                        <td colSpan={3}>
                          <div className="member-details">
                            <h4>Atividades:</h4>
                            <ul className='newmemberagr'> 
                              {memberActivities[member.name]?.tasks
                                .filter(activity => {
                                  const scales = JSON.parse(localStorage.getItem('scales') || '[]') as Scale[];
                                  const scalesForActivity = scales.filter((scale) => 
                                    (scale.status === 'active' || scale.status === 'cancelled') && 
                                    scale.activityName === activity && 
                                    scale.team.some(teamMember => teamMember.name === member.name)
                                  );
                                  
                                  const activeScales = scalesForActivity.filter(scale => scale.status === 'active');
                                  const cancelledScales = scalesForActivity.filter(scale => scale.status === 'cancelled');
                                  
                                  const leaderCount = activeScales.filter(scale => 
                                    scale.team.some(teamMember => 
                                      teamMember.name === member.name && teamMember.role === 'leader'
                                    )
                                  ).length;
                                  
                                  const normalCount = activeScales.filter(scale => 
                                    scale.team.some(teamMember => 
                                      teamMember.name === member.name && teamMember.role !== 'leader'
                                    )
                                  ).length;
                                  
                                  const totalPayment = activeScales.reduce((total, scale) => {
                                    const memberInTeam = scale.team.find(teamMember => teamMember.name === member.name);
                                    return total + (memberInTeam?.payment || 0);
                                  }, 0);
                                  
                                  return (
                                    <li key={activity}>
                                      <span>{activity}</span>
                                      <span className='seg'>Líder: {leaderCount} - Normal: {normalCount}</span>
                                      <span className='ter'>R$ {totalPayment.toFixed(2)}</span>
                                    </li>
                                  );
                                })}
                            </ul>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Reports;
