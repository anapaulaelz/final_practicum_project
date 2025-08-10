// Initialize the charts
document.addEventListener('DOMContentLoaded', function() {
    console.log('Demand forecasting page loaded');
    let globalChart = null;
    let globalData = null;
    let salesDonutChart = null;
    let conversionChart = null;
    let originalSalesData = null;
    let originalConversionData = null;
    let currentDateRange = { from: null, to: null };

    // Initialize date filters
    initializeDateFilters();

    function initializeDateFilters() {
        const fromDateInput = document.getElementById('fromDate');
        const toDateInput = document.getElementById('toDate');
        const applyBtn = document.getElementById('applyFilters');
        const resetBtn = document.getElementById('resetFilters');

        // Set default date range from April 2025 to today (August 5, 2025)
        fromDateInput.value = '2025-04-01';
        toDateInput.value = '2025-08-05';

        applyBtn.addEventListener('click', function() {
            const fromDate = fromDateInput.value;
            const toDate = toDateInput.value;
            
            if (fromDate && toDate) {
                currentDateRange.from = new Date(fromDate);
                currentDateRange.to = new Date(toDate);
                
                // Update all charts with filtered data
                updateChartsWithDateFilter();
            }
        });

        resetBtn.addEventListener('click', function() {
            currentDateRange.from = new Date('2025-04-01');
            currentDateRange.to = new Date('2025-08-05');
            fromDateInput.value = '2025-04-01';
            toDateInput.value = '2025-08-05';
            
            // Reset all charts to default date range
            updateChartsWithDateFilter();
        });
    }

    function updateChartsWithDateFilter() {
        // Update forecast chart
        if (globalChart && globalData) {
            updateForecastChart();
        }
        
        // Update sales chart with date filtering
        if (originalSalesData) {
            updateSalesChart();
        }
        
        // Update conversion chart
        if (originalConversionData) {
            updateConversionChart();
        }
    }

    function updateSalesChart() {
        if (!originalSalesData) return;
        
        let filteredSalesData = originalSalesData;
        
        if (currentDateRange.from && currentDateRange.to) {
            filteredSalesData = originalSalesData.filter(row => {
                const dateStr = row['Día'];
                if (!dateStr) return false;
                
                // Parse date in DD/MM/YY format (e.g., "06/08/24")
                let rowDate;
                if (dateStr.includes('/')) {
                    const parts = dateStr.split('/');
                    if (parts.length === 3) {
                        // Handle DD/MM/YY format
                        const day = parseInt(parts[0]);
                        const month = parseInt(parts[1]) - 1; // Month is 0-indexed
                        let year = parseInt(parts[2]);
                        
                        // Convert 2-digit year to 4-digit
                        if (year < 50) {
                            year += 2000;
                        } else if (year < 100) {
                            year += 1900;
                        }
                        
                        rowDate = new Date(year, month, day);
                    }
                } else {
                    rowDate = new Date(dateStr);
                }
                
                if (isNaN(rowDate.getTime())) return false;
                return rowDate >= currentDateRange.from && rowDate <= currentDateRange.to;
            });
        }
        
        processSalesData(filteredSalesData);
    }

    function updateForecastChart() {
        let filteredData = globalData;
        
        if (currentDateRange.from && currentDateRange.to) {
            filteredData = globalData.filter(row => {
                if (!row.date) return false;
                // Parse date in YYYY-MM-DD format
                const rowDate = new Date(row.date);
                
                if (isNaN(rowDate.getTime())) return false;
                return rowDate >= currentDateRange.from && rowDate <= currentDateRange.to;
            });
        }

        // Function to create connecting datasets (reusable from chart creation)
        function createConnectingDatasets(data) {
            // Find the last historical value and its index
            let lastHistoricalValue = null;
            let lastHistoricalIndex = -1;
            
            for (let i = data.length - 1; i >= 0; i--) {
                if (data[i].historical && !isNaN(parseFloat(data[i].historical))) {
                    lastHistoricalValue = parseFloat(data[i].historical);
                    lastHistoricalIndex = i;
                    break;
                }
            }

            // Create connection datasets for each forecast type
            const connectingDatasets = [];
            
            if (lastHistoricalValue !== null && lastHistoricalIndex !== -1) {
                const forecastTypes = [
                    { key: 'realista', color: '#ecc94b', label: 'Realistic Connection' },
                    { key: 'pesimista', color: '#f56565', label: 'Pessimistic Connection' },
                    { key: 'optimista', color: '#48bb78', label: 'Optimistic Connection' }
                ];

                forecastTypes.forEach(forecast => {
                    // Find the first forecast value for this type
                    let firstForecastValue = null;
                    let firstForecastIndex = -1;
                    
                    for (let i = lastHistoricalIndex; i < data.length; i++) {
                        if (data[i][forecast.key] && !isNaN(parseFloat(data[i][forecast.key]))) {
                            firstForecastValue = parseFloat(data[i][forecast.key]);
                            firstForecastIndex = i;
                            break;
                        }
                    }

                    // Create connecting line dataset
                    if (firstForecastValue !== null && firstForecastIndex !== -1) {
                        const connectionData = new Array(data.length).fill(null);
                        connectionData[lastHistoricalIndex] = lastHistoricalValue;
                        connectionData[firstForecastIndex] = firstForecastValue;

                        connectingDatasets.push({
                            label: forecast.label,
                            data: connectionData,
                            borderColor: forecast.color,
                            borderWidth: 1,
                            borderDash: [2, 2],
                            tension: 0,
                            fill: false,
                            pointRadius: 0,
                            pointHoverRadius: 0,
                            showLine: true
                        });
                    }
                });
            }

            return connectingDatasets;
        }

        if (globalChart) {
            // Update main datasets
            globalChart.data.labels = filteredData.map(row => row.date);
            globalChart.data.datasets[0].data = filteredData.map(row => row.historical ? parseFloat(row.historical) : null);
            globalChart.data.datasets[1].data = filteredData.map(row => row.realista ? parseFloat(row.realista) : null);
            globalChart.data.datasets[2].data = filteredData.map(row => row.pesimista ? parseFloat(row.pesimista) : null);
            globalChart.data.datasets[3].data = filteredData.map(row => row.optimista ? parseFloat(row.optimista) : null);
            
            // Remove old connecting datasets (indices 4 and above)
            while (globalChart.data.datasets.length > 4) {
                globalChart.data.datasets.pop();
            }
            
            // Add new connecting datasets
            const connectingDatasets = createConnectingDatasets(filteredData);
            globalChart.data.datasets.push(...connectingDatasets);
            
            globalChart.update();
        }
    }

    function updateConversionChart() {
        if (!originalConversionData) return;
        
        let filteredData = originalConversionData;
        
        if (currentDateRange.from && currentDateRange.to) {
            filteredData = originalConversionData.filter(row => {
                const dateStr = row['Día'];
                if (!dateStr) return false;
                
                // Parse date in YYYY-MM-DD format
                const rowDate = new Date(dateStr);
                
                if (isNaN(rowDate.getTime())) return false;
                return rowDate >= currentDateRange.from && rowDate <= currentDateRange.to;
            });
        }
        
        processConversionData(filteredData);
    }

    // Holiday data for Mexican holidays
    const holidayData = {
        independence: {
            title: "Mexican Independence Day",
            description: "Commemorates the beginning of Mexico's War of Independence from Spanish rule on September 16, 1810. Miguel Hidalgo's famous 'Grito de Dolores' marked the start of the revolution. This is Mexico's most important patriotic holiday, celebrated with parades, fireworks, and traditional foods. Families gather for festivities and many businesses close for extended celebrations.",
            impact: "High sales impact expected due to increased consumer spending on gifts, decorations, and celebratory items. Peak demand for patriotic-themed products and traditional Mexican goods."
        },
        revolution: {
            title: "Mexican Revolution Day",
            description: "Honors the Mexican Revolution that began in 1910, led by figures like Francisco I. Madero, Emiliano Zapata, and Pancho Villa. This revolution transformed Mexico's political and social landscape. The holiday celebrates the fight for social justice, land reform, and democratic ideals that shaped modern Mexico.",
            impact: "Moderate sales impact as it's a federal holiday with school and government closures. Increased demand for historical books, educational materials, and Mexican heritage items."
        },
        christmas: {
            title: "Christmas (Navidad)",
            description: "Christmas in Mexico blends Catholic traditions with indigenous customs. Celebrations include Las Posadas (December 16-24), where communities reenact Mary and Joseph's search for lodging. Families gather for Nochebuena (Christmas Eve) dinner, and children receive gifts from both Santa Claus and the Three Kings.",
            impact: "Highest sales impact of the year. Peak demand for gifts, decorations, food items, and luxury goods. Extended shopping season from early December through early January."
        },
        epiphany: {
            title: "Día de los Reyes Magos (Three Kings Day)",
            description: "Celebrates the arrival of the Three Wise Men who brought gifts to baby Jesus. In Mexico, this is when children traditionally receive their main Christmas gifts. Families share 'Rosca de Reyes,' a special bread with hidden figurines. Finding a figurine means you must host a party on Candlemas (February 2).",
            impact: "Very high sales impact for toys, children's gifts, and bakery items. Second major gift-giving occasion after Christmas, extending the holiday shopping season."
        }
    };

    // Initialize holiday modal functionality
    initializeHolidayModal();

    function initializeHolidayModal() {
        const modal = document.getElementById('holidayModal');
        const closeBtn = document.querySelector('.close-modal');
        const dateItems = document.querySelectorAll('.cosmic-date-item');

        // Add click listeners to date items
        dateItems.forEach(item => {
            item.addEventListener('click', function() {
                const holidayKey = this.getAttribute('data-holiday');
                const holiday = holidayData[holidayKey];
                
                if (holiday) {
                    document.getElementById('modalTitle').textContent = holiday.title;
                    document.getElementById('modalDescription').textContent = holiday.description;
                    document.getElementById('modalImpact').textContent = holiday.impact;
                    modal.style.display = 'block';
                }
            });
        });

        // Close modal listeners
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });

        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    }

    // Load and process sales data
    Papa.parse('../../data/Total_sales_per_product.csv', {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            originalSalesData = results.data;
            processSalesData(originalSalesData);
        }
    });

    function processSalesData(salesData) {
        // Process sales data with grouping
        const productSales = {
            'Manhattan Eau de Parfum': 0,
            'Tundra Eau de Parfum': 0,
            'Sahara Eau de Parfum': 0,
            'Set LeBorêt No. 1': 0,
            'Other': 0
        };
        let totalUnits = 0;
        
        salesData.forEach(row => {
            const product = row['Nombre del producto'];
            const units = parseInt(row['Artículos netos vendidos']) || 0;
            
            // Exclude test data (prueba1)
            if (product && !product.toLowerCase().includes('prueba')) {
                totalUnits += units;
                
                if (product.includes('Manhattan')) {
                    productSales['Manhattan Eau de Parfum'] += units;
                } else if (product.includes('Tundra')) {
                    productSales['Tundra Eau de Parfum'] += units;
                } else if (product.includes('Sahara')) {
                    productSales['Sahara Eau de Parfum'] += units;
                } else if (product.includes('Set LeBorêt No. 1')) {
                    productSales['Set LeBorêt No. 1'] += units;
                } else {
                    productSales['Other'] += units;
                }
            }
        });

        // Update total count
        const totalSalesCount = document.getElementById('totalSalesCount');
        totalSalesCount.textContent = `${totalUnits.toLocaleString()} Units`;

        // Blue color palette with different shades
        const colors = [
            '#1e40af', // dark blue - Manhattan
            '#3b82f6', // medium blue - Tundra
            '#60a5fa', // light blue - Sahara
            '#93c5fd', // lighter blue - Set LeBorêt No. 1
            '#dbeafe', // lightest blue - Other
        ];

        const productNames = Object.keys(productSales).filter(name => productSales[name] > 0);
        const productData = productNames.map(name => productSales[name]);
        
        // Shorten the product names for x-axis labels
        const shortLabels = productNames.map(name => {
            if (name.includes('Manhattan')) return 'Manhattan';
            if (name.includes('Tundra')) return 'Tundra';
            if (name.includes('Sahara')) return 'Sahara';
            if (name.includes('Set LeBorêt')) return 'Set';
            return 'Other';
        });

        // If chart already exists, update it; otherwise create it
        if (salesDonutChart) {
            salesDonutChart.data.labels = shortLabels;
            salesDonutChart.data.datasets[0].data = productData;
            salesDonutChart.data.datasets[0].backgroundColor = colors;
            salesDonutChart.data.datasets[0].borderColor = colors;
            salesDonutChart.update();
        } else {
            createSalesChart(shortLabels, productData, colors, totalUnits);
        }
    }

    function createSalesChart(shortLabels, productData, colors, totalUnits) {
        // Initialize bar chart
        const barCtx = document.getElementById('salesBarChart').getContext('2d');
        
        // Custom plugin to draw numbers on bars
        const drawNumbersPlugin = {
            id: 'drawNumbers',
            afterDatasetsDraw(chart) {
                const { ctx } = chart;
                ctx.save();
                ctx.font = 'bold 14px Space Grotesk';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 1;
                ctx.shadowOffsetY = 1;

                chart.data.datasets.forEach((dataset, i) => {
                    const meta = chart.getDatasetMeta(i);
                    meta.data.forEach((bar, index) => {
                        const data = dataset.data[index];
                        ctx.fillText(data.toLocaleString(), bar.x, bar.y - 10);
                    });
                });
                
                ctx.restore();
            }
        };

        salesDonutChart = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: shortLabels,
                datasets: [{
                    label: 'Units Sold',
                    data: productData,
                    backgroundColor: colors,
                    borderColor: colors,
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                }]
            },
            plugins: [drawNumbersPlugin],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(10, 15, 31, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        titleFont: {
                            family: 'Space Grotesk',
                            size: 14,
                            weight: 600
                        },
                        bodyFont: {
                            family: 'Inter',
                            size: 13
                        },
                        padding: 12,
                        borderColor: 'rgba(66, 153, 225, 0.5)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.y || 0;
                                const percentage = ((value / totalUnits) * 100).toFixed(1);
                                return `Units: ${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#a0aec0',
                            font: {
                                family: 'Inter',
                                size: 12,
                                weight: 500
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: Math.max(...productData) * 1.2, // Add 20% padding above highest bar
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#a0aec0',
                            font: {
                                family: 'Inter',
                                size: 11
                            }
                        }
                    }
                },
                animation: {
                    duration: 1500,
                    easing: 'easeOutBounce'
                }
            }
        });
    }

    Papa.parse('../../data/full_forecast_with_history.csv', {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            console.log('Data loaded:', results.data); // Debug data loading
            globalData = results.data.filter(row => row.date);
            
            const ctx = document.getElementById('forecastChart').getContext('2d');
            if (!ctx) {
                console.error('Could not get chart context');
                return;
            }

            // Function to create connecting datasets
            function createConnectingDatasets(data) {
                // Find the last historical value and its index
                let lastHistoricalValue = null;
                let lastHistoricalIndex = -1;
                
                for (let i = data.length - 1; i >= 0; i--) {
                    if (data[i].historical && !isNaN(parseFloat(data[i].historical))) {
                        lastHistoricalValue = parseFloat(data[i].historical);
                        lastHistoricalIndex = i;
                        break;
                    }
                }

                // Create connection datasets for each forecast type
                const connectingDatasets = [];
                
                if (lastHistoricalValue !== null && lastHistoricalIndex !== -1) {
                    const forecastTypes = [
                        { key: 'realista', color: '#ecc94b', label: 'Realistic Connection' },
                        { key: 'pesimista', color: '#f56565', label: 'Pessimistic Connection' },
                        { key: 'optimista', color: '#48bb78', label: 'Optimistic Connection' }
                    ];

                    forecastTypes.forEach(forecast => {
                        // Find the first forecast value for this type
                        let firstForecastValue = null;
                        let firstForecastIndex = -1;
                        
                        for (let i = lastHistoricalIndex; i < data.length; i++) {
                            if (data[i][forecast.key] && !isNaN(parseFloat(data[i][forecast.key]))) {
                                firstForecastValue = parseFloat(data[i][forecast.key]);
                                firstForecastIndex = i;
                                break;
                            }
                        }

                        // Create connecting line dataset
                        if (firstForecastValue !== null && firstForecastIndex !== -1) {
                            const connectionData = new Array(data.length).fill(null);
                            connectionData[lastHistoricalIndex] = lastHistoricalValue;
                            connectionData[firstForecastIndex] = firstForecastValue;

                            connectingDatasets.push({
                                label: forecast.label,
                                data: connectionData,
                                borderColor: forecast.color,
                                borderWidth: 1,
                                borderDash: [2, 2],
                                tension: 0,
                                fill: false,
                                pointRadius: 0,
                                pointHoverRadius: 0,
                                showLine: true
                            });
                        }
                    });
                }

                return connectingDatasets;
            }

            // Update chart with all data before initialization
            const connectingDatasets = createConnectingDatasets(globalData);
            
            const chartData = {
                labels: globalData.map(row => row.date),
                datasets: [
                    {
                        label: 'Historical',
                        data: globalData.map(row => row.historical ? parseFloat(row.historical) : null),
                        borderColor: '#4299e1',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: 'Realistic',
                        data: globalData.map(row => row.realista ? parseFloat(row.realista) : null),
                        borderColor: '#ecc94b',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: 'Pessimistic',
                        data: globalData.map(row => row.pesimista ? parseFloat(row.pesimista) : null),
                        borderColor: '#f56565',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: 'Optimistic',
                        data: globalData.map(row => row.optimista ? parseFloat(row.optimista) : null),
                        borderColor: '#48bb78',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        tension: 0.4,
                        fill: false
                    },
                    ...connectingDatasets
                ]
            };

            // Initialize chart with data
            globalChart = new Chart(ctx, {
                type: 'line',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        tooltip: {
                            mode: 'index',
                            intersect: false
                        },
                        legend: {
                            position: 'top',
                            labels: {
                                color: '#ffffff',
                                usePointStyle: true,
                                font: {
                                    family: 'Space Grotesk',
                                    size: 16,
                                    weight: 600
                                },
                                padding: 20,
                                boxWidth: 15,
                                boxHeight: 15,
                                filter: function(legendItem, chartData) {
                                    // Hide connection line datasets from legend
                                    return !legendItem.text.includes('Connection');
                                }
                            },
                            onClick: function(e, legendItem, legend) {
                                const chart = legend.chart;
                                const index = legendItem.datasetIndex;
                                const meta = chart.getDatasetMeta(index);
                                
                                // Toggle visibility of the clicked dataset
                                meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : null;
                                
                                // Find and toggle corresponding connection line
                                const dataset = chart.data.datasets[index];
                                if (dataset.label === 'Realistic') {
                                    const connectionIndex = chart.data.datasets.findIndex(d => d.label === 'Realistic Connection');
                                    if (connectionIndex !== -1) {
                                        const connectionMeta = chart.getDatasetMeta(connectionIndex);
                                        connectionMeta.hidden = meta.hidden;
                                    }
                                } else if (dataset.label === 'Pessimistic') {
                                    const connectionIndex = chart.data.datasets.findIndex(d => d.label === 'Pessimistic Connection');
                                    if (connectionIndex !== -1) {
                                        const connectionMeta = chart.getDatasetMeta(connectionIndex);
                                        connectionMeta.hidden = meta.hidden;
                                    }
                                } else if (dataset.label === 'Optimistic') {
                                    const connectionIndex = chart.data.datasets.findIndex(d => d.label === 'Optimistic Connection');
                                    if (connectionIndex !== -1) {
                                        const connectionMeta = chart.getDatasetMeta(connectionIndex);
                                        connectionMeta.hidden = meta.hidden;
                                    }
                                }
                                
                                chart.update();
                            }
                        }
                    },
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'month',
                                displayFormats: {
                                    month: 'MMM yyyy'
                                }
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#a0aec0'
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#a0aec0'
                            }
                        }
                    }
                }
            });

            // Apply initial date filter to match the default date range
            currentDateRange.from = new Date('2025-04-01');
            currentDateRange.to = new Date('2025-08-05');
            updateForecastChart();
        },
        error: function(error) {
            console.error('Error loading data:', error);
        }
    });

    // Load and process conversion rate data
    Papa.parse('../../data/conversion_rate.csv', {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            originalConversionData = results.data;
            processConversionData(originalConversionData);
        }
    });

    function processConversionData(conversionData) {
        let sessions2024 = 0;
        let sessions2025 = 0;
        let totalConversions2024 = 0;
        let totalConversions2025 = 0;
        
        conversionData.forEach(row => {
            const date = row['Día'];
            const sessions = parseInt(row['Sesiones']) || 0;
            const conversions = parseInt(row['Sesiones en las que se completó el pago']) || 0;
            
            if (date && date.includes('2024')) {
                sessions2024 += sessions;
                totalConversions2024 += conversions;
            } else if (date && date.includes('2025')) {
                sessions2025 += sessions;
                totalConversions2025 += conversions;
            }
        });

        // Calculate overall conversion rates
        const conversionRate2024 = sessions2024 > 0 ? (totalConversions2024 / sessions2024 * 100) : 0;
        const conversionRate2025 = sessions2025 > 0 ? (totalConversions2025 / sessions2025 * 100) : 0;
        const overallConversionRate = (sessions2024 + sessions2025) > 0 ? 
            ((totalConversions2024 + totalConversions2025) / (sessions2024 + sessions2025) * 100) : 0;

        // Blue color palette for conversion chart
        const conversionColors = [
            '#1e40af', // dark blue - 2024
            '#60a5fa', // light blue - 2025
        ];

        const sessionData = [sessions2024, sessions2025];
        const yearLabels = ['2024', '2025'];

        // If chart already exists, update it; otherwise create it
        if (conversionChart) {
            conversionChart.data.labels = yearLabels;
            conversionChart.data.datasets[0].data = sessionData;
            conversionChart.update();
        } else {
            createConversionChart(yearLabels, sessionData, conversionColors, conversionRate2024, conversionRate2025);
        }

        // Update conversion rate display
        const conversionRateDisplay = document.getElementById('conversionRateDisplay');
        if (conversionRateDisplay) {
            conversionRateDisplay.textContent = `${overallConversionRate.toFixed(2)}%`;
        }
    }

    function createConversionChart(yearLabels, sessionData, conversionColors, conversionRate2024, conversionRate2025) {
        // Create conversion rate chart
        const conversionCtx = document.getElementById('conversionChart').getContext('2d');
        
        // Custom plugin for conversion numbers
        const conversionNumbersPlugin = {
            id: 'conversionNumbers',
            afterDatasetsDraw(chart) {
                const { ctx } = chart;
                ctx.save();
                ctx.font = 'bold 14px Space Grotesk';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 1;
                ctx.shadowOffsetY = 1;

                chart.data.datasets.forEach((dataset, i) => {
                    const meta = chart.getDatasetMeta(i);
                    meta.data.forEach((bar, index) => {
                        const data = dataset.data[index];
                        ctx.fillText(data.toLocaleString(), bar.x, bar.y - 10);
                    });
                });
                
                ctx.restore();
            }
        };

        conversionChart = new Chart(conversionCtx, {
            type: 'bar',
            data: {
                labels: yearLabels,
                datasets: [{
                    label: 'Total Sessions',
                    data: sessionData,
                    backgroundColor: conversionColors,
                    borderColor: conversionColors,
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                }]
            },
            plugins: [conversionNumbersPlugin],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(10, 15, 31, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        titleFont: {
                            family: 'Space Grotesk',
                            size: 14,
                            weight: 600
                        },
                        bodyFont: {
                            family: 'Inter',
                            size: 13
                        },
                        padding: 12,
                        borderColor: 'rgba(66, 153, 225, 0.5)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const year = context.label;
                                const sessions = context.parsed.y;
                                const rate = year === '2024' ? conversionRate2024 : conversionRate2025;
                                return [
                                    `Sessions: ${sessions.toLocaleString()}`,
                                    `Conversion Rate: ${rate.toFixed(2)}%`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#a0aec0',
                            font: {
                                family: 'Inter',
                                size: 12,
                                weight: 500
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: Math.max(...sessionData) * 1.2,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#a0aec0',
                            font: {
                                family: 'Inter',
                                size: 11
                            }
                        }
                    }
                },
                animation: {
                    duration: 1500,
                    easing: 'easeOutBounce'
                }
            }
        });
    }

    // Demand Tasks Management
    function initializeDemandTasks() {
        // Sample demand forecasting tasks - these would typically come from your backend/API
        const demandTasks = [
            {
                id: 1,
                title: "Update demand forecast model",
                description: "Incorporate latest sales data into Q3 forecasting model",
                priority: "high",
                status: "todo",
                dueDate: "2025-08-10",
                createdDate: "2025-08-06"
            },
            {
                id: 5,
                title: "Weekly forecast analysis",
                description: "Generate automated weekly demand analysis report",
                priority: "low",
                status: "completed",
                dueDate: "2025-08-05",
                createdDate: "2025-08-01"
            },
            {
                id: 6,
                title: "Seasonal trend analysis",
                description: "Analyze Q4 holiday patterns for 2025 forecasting",
                priority: "medium",
                status: "progress",
                dueDate: "2025-08-15",
                createdDate: "2025-08-03"
            },
            {
                id: 7,
                title: "Model accuracy validation",
                description: "Compare predicted vs actual sales for July 2025",
                priority: "high",
                status: "todo",
                dueDate: "2025-08-08",
                createdDate: "2025-08-06"
            },
            {
                id: 8,
                title: "Holiday impact assessment",
                description: "Evaluate Independence Day sales impact on forecast model",
                priority: "medium",
                status: "completed",
                dueDate: "2025-08-07",
                createdDate: "2025-08-04"
            }
        ];

        renderDemandTasks(demandTasks);
    }

    function renderDemandTasks(tasks) {
        const todoList = document.getElementById('demandTodoList');
        const progressList = document.getElementById('demandProgressList');
        const completedList = document.getElementById('demandCompletedList');

        // Clear existing content
        if (todoList) todoList.innerHTML = '';
        if (progressList) progressList.innerHTML = '';
        if (completedList) completedList.innerHTML = '';

        // Group tasks by status
        const todoTasks = tasks.filter(task => task.status === 'todo');
        const progressTasks = tasks.filter(task => task.status === 'progress');
        const completedTasks = tasks.filter(task => task.status === 'completed');

        // Render tasks in each section
        if (todoList) renderTasksInSection(todoTasks, todoList);
        if (progressList) renderTasksInSection(progressTasks, progressList);
        if (completedList) renderTasksInSection(completedTasks, completedList);

        // Show empty states if no tasks
        if (todoTasks.length === 0 && todoList) {
            todoList.innerHTML = '<div class="demand-empty-state"><div class="demand-empty-icon">📋</div><p>No pending tasks</p></div>';
        }
        if (progressTasks.length === 0 && progressList) {
            progressList.innerHTML = '<div class="demand-empty-state"><div class="demand-empty-icon">⚙️</div><p>No active tasks</p></div>';
        }
        if (completedTasks.length === 0 && completedList) {
            completedList.innerHTML = '<div class="demand-empty-state"><div class="demand-empty-icon">✅</div><p>No completed tasks</p></div>';
        }
    }

    function renderTasksInSection(tasks, container) {
        tasks.forEach(task => {
            const taskCard = createDemandTaskCard(task);
            container.appendChild(taskCard);
        });
    }

    function createDemandTaskCard(task) {
        const card = document.createElement('div');
        card.className = 'demand-task-card';
        card.setAttribute('data-task-id', task.id);

        const priorityClass = `demand-priority-${task.priority}`;

        card.innerHTML = `
            <div class="demand-task-header">
                <h4 class="demand-task-title">${task.title}</h4>
                <span class="demand-task-priority ${priorityClass}">${task.priority}</span>
            </div>
            <p class="demand-task-description">${task.description}</p>
            <div class="demand-task-meta">
                <span class="demand-task-date">Due: ${task.dueDate}</span>
            </div>
        `;

        // Add click handler to show task details
        card.addEventListener('click', function() {
            showTaskDetails(task);
        });

        return card;
    }

    function showTaskDetails(task) {
        // Simple alert for now - you could replace this with a modal
        const statusText = task.status.charAt(0).toUpperCase() + task.status.slice(1);
        alert(`Task: ${task.title}\nDescription: ${task.description}\nPriority: ${task.priority}\nStatus: ${statusText}\nDue Date: ${task.dueDate}`);
    }

    // Initialize demand tasks when DOM is loaded
    initializeDemandTasks();
});