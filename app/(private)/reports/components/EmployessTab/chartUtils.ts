// app/reports/components/employees/chartUtils.ts
export const getChartTheme = () => {
  return {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    colors: {
      primary: '#3B82F6',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      blue: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'],
      green: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
      orange: ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A']
    }
  };
};

export const salesChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 11
        },
        maxRotation: 45,
        minRotation: 45
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: '#E5E7EB'
      },
      ticks: {
        font: {
          size: 11
        }
      }
    }
  },
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        font: {
          size: 12
        },
        usePointStyle: true,
        padding: 20
      }
    },
    tooltip: {
      backgroundColor: '#1F2937',
      titleFont: {
        size: 13
      },
      bodyFont: {
        size: 13
      },
      padding: 12,
      cornerRadius: 6,
      callbacks: {
        label: function(context: any) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.dataset.label.includes('R$')) {
            label += 'R$ ' + context.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
          } else {
            label += context.parsed.y;
          }
          return label;
        }
      }
    }
  },
  animation: {
    duration: 1000,
    easing: 'easeOutQuart'
  }
};

export const rankingChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y' as const,
  scales: {
    x: {
      beginAtZero: true,
      grid: {
        color: '#E5E7EB'
      },
      ticks: {
        font: {
          size: 11
        },
        callback: function(value: any) {
          return 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 0 });
        }
      }
    },
    y: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 11
        }
      }
    }
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: '#1F2937',
      titleFont: {
        size: 13
      },
      bodyFont: {
        size: 13
      },
      padding: 12,
      cornerRadius: 6,
      callbacks: {
        label: function(context: any) {
          return 'R$ ' + context.parsed.x.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        }
      }
    }
  }
};