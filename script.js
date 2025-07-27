// 智慧家庭儀表板 JavaScript

class SmartHomeDashboard {
    constructor() {
        this.appliances = {
            aircon: { name: '冷氣', power: 850, status: true, icon: '❄️' },
            light: { name: '燈光', power: 120, status: true, icon: '💡' },
            tv: { name: '電視', power: 200, status: false, icon: '📺' },
            fridge: { name: '冰箱', power: 300, status: true, icon: '🧊' },
            washing: { name: '洗衣機', power: 450, status: false, icon: '🧺' },
            dishwasher: { name: '洗碗機', power: 600, status: false, icon: '🍽️' }
        };

        this.currentPeriod = 'week';
        this.powerChart = null;
        this.peakChart = null;

        this.init();
    }

    init() {
        this.updateDateTime();
        this.setupEventListeners();
        this.updateDeviceStatus();
        this.updateRealtimeInfo();
        this.createPowerChart();
        this.createPeakChart();
        this.startRealTimeUpdates();

        // 每分鐘更新時間
        setInterval(() => this.updateDateTime(), 60000);
    }

    updateDateTime() {
        const now = new Date();
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            weekday: 'long'
        };
        document.getElementById('datetime').textContent = now.toLocaleDateString('zh-TW', options);
    }

    setupEventListeners() {
        // 家電開關監聽
        Object.keys(this.appliances).forEach(deviceId => {
            const toggle = document.getElementById(`${deviceId}-toggle`);
            if (toggle) {
                toggle.addEventListener('change', (e) => {
                    this.toggleDevice(deviceId, e.target.checked);
                });
            }
        });

        // 週期切換按鈕監聽
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchPeriod(e.target.dataset.period);
            });
        });
    }

    toggleDevice(deviceId, status) {
        this.appliances[deviceId].status = status;
        
        // 更新家電項目樣式
        const applianceItem = document.querySelector(`[data-device="${deviceId}"]`);
        if (status) {
            applianceItem.classList.add('active');
        } else {
            applianceItem.classList.remove('active');
        }

        // 更新相關資訊
        this.updateRealtimeInfo();
        this.updateDeviceStatus();
        
        console.log(`${this.appliances[deviceId].name} ${status ? '開啟' : '關閉'}`);
    }

    switchPeriod(period) {
        this.currentPeriod = period;
        
        // 更新按鈕狀態
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-period="${period}"]`).classList.add('active');

        // 更新圖表
        this.updatePowerChart();
    }

    updateRealtimeInfo() {
        // 計算目前總耗電
        let totalPower = 0;
        let maxPowerDevice = null;
        let maxPower = 0;

        Object.entries(this.appliances).forEach(([id, device]) => {
            if (device.status) {
                totalPower += device.power;
                if (device.power > maxPower) {
                    maxPower = device.power;
                    maxPowerDevice = device;
                }
            }
        });

        // 更新顯示
        document.getElementById('currentPower').textContent = `${totalPower.toLocaleString()}W`;
        
        if (maxPowerDevice) {
            document.getElementById('topConsumer').textContent = 
                `${maxPowerDevice.name} (${maxPowerDevice.power}W)`;
        } else {
            document.getElementById('topConsumer').textContent = '無設備運行';
        }

        // 計算今日用電和預估費用
        const todayUsage = (totalPower * 16.5 / 1000).toFixed(1); // 假設平均使用16.5小時
        const estimatedCost = Math.round(todayUsage * 6); // 假設每度電6元

        document.getElementById('todayUsage').textContent = `${todayUsage} kWh`;
        document.getElementById('estimatedCost').textContent = `NT$ ${estimatedCost}`;
    }

    updateDeviceStatus() {
        const onlineCount = Object.values(this.appliances).filter(device => device.status).length;
        const totalCount = Object.keys(this.appliances).length;
        const offlineCount = totalCount - onlineCount;

        document.getElementById('onlineDevices').textContent = onlineCount;
        document.getElementById('offlineDevices').textContent = offlineCount;
        document.getElementById('totalDevices').textContent = totalCount;

        // 更新設備列表
        this.updateDeviceList();
    }

    updateDeviceList() {
        const deviceList = document.getElementById('deviceList');
        deviceList.innerHTML = '';

        Object.entries(this.appliances).forEach(([id, device]) => {
            const deviceItem = document.createElement('div');
            deviceItem.className = 'device-item';
            deviceItem.innerHTML = `
                <span class="device-name">${device.icon} ${device.name}</span>
                <span class="device-status ${device.status ? 'online' : 'offline'}">
                    ${device.status ? '運行中' : '關閉'}
                </span>
            `;
            deviceList.appendChild(deviceItem);
        });
    }

    generateWeeklyData() {
        const days = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];
        return days.map(() => ({
            usage: Math.random() * 30 + 15,
            cost: Math.random() * 200 + 100
        }));
    }

    generateMonthlyData() {
        const data = [];
        for (let i = 1; i <= 30; i++) {
            data.push({
                usage: Math.random() * 35 + 20,
                cost: Math.random() * 250 + 120
            });
        }
        return data;
    }

    createPowerChart() {
        const weeklyData = this.generateWeeklyData();
        const categories = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];

        this.powerChart = Highcharts.chart('powerChart', {
            chart: {
                type: 'column',
                backgroundColor: 'transparent',
                style: {
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }
            },
            title: {
                text: null
            },
            xAxis: {
                categories: categories,
                labels: {
                    style: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '12px'
                    }
                },
                lineColor: 'rgba(255, 255, 255, 0.2)',
                tickColor: 'rgba(255, 255, 255, 0.2)'
            },
            yAxis: {
                title: {
                    text: '用電量 (kWh)',
                    style: {
                        color: 'rgba(255, 255, 255, 0.8)'
                    }
                },
                labels: {
                    style: {
                        color: 'rgba(255, 255, 255, 0.8)'
                    }
                },
                gridLineColor: 'rgba(255, 255, 255, 0.1)'
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                column: {
                    borderRadius: 4,
                    borderWidth: 0,
                    pointPadding: 0.1,
                    groupPadding: 0.1
                }
            },
            series: [{
                name: '用電量',
                data: weeklyData.map(d => d.usage),
                color: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, 'rgba(58, 107, 198, 0.8)'],
                        [1, 'rgba(58, 107, 198, 0.4)']
                    ]
                }
            }],
            credits: {
                enabled: false
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                style: {
                    color: 'white'
                },
                formatter: function() {
                    return `<b>${this.x}</b><br/>用電量: ${this.y.toFixed(1)} kWh`;
                }
            }
        });
    }

    updatePowerChart() {
        if (!this.powerChart) return;

        let data, categories;
        
        if (this.currentPeriod === 'week') {
            const weeklyData = this.generateWeeklyData();
            categories = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];
            data = weeklyData.map(d => d.usage);
        } else {
            const monthlyData = this.generateMonthlyData();
            categories = Array.from({length: 30}, (_, i) => `${i + 1}日`);
            data = monthlyData.map(d => d.usage);
        }

        this.powerChart.xAxis[0].setCategories(categories);
        this.powerChart.series[0].setData(data);
    }

    createPeakChart() {
        const hours = Array.from({length: 24}, (_, i) => `${i}:00`);
        const peakData = hours.map(() => Math.random() * 3 + 0.5);

        this.peakChart = Highcharts.chart('peakChart', {
            chart: {
                type: 'spline',
                backgroundColor: 'transparent'
            },
            title: {
                text: null
            },
            xAxis: {
                categories: hours.filter((_, i) => i % 3 === 0), // 每3小時顯示一次
                labels: {
                    style: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '10px'
                    }
                },
                lineColor: 'rgba(255, 255, 255, 0.2)',
                tickColor: 'rgba(255, 255, 255, 0.2)'
            },
            yAxis: {
                title: {
                    text: 'kWh',
                    style: {
                        color: 'rgba(255, 255, 255, 0.8)'
                    }
                },
                labels: {
                    style: {
                        color: 'rgba(255, 255, 255, 0.8)'
                    }
                },
                gridLineColor: 'rgba(255, 255, 255, 0.1)'
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                spline: {
                    marker: {
                        enabled: false
                    }
                }
            },
            series: [{
                name: '用電量',
                data: peakData.filter((_, i) => i % 3 === 0),
                color: 'rgba(255, 193, 7, 0.8)',
                lineWidth: 3,
                shadow: true
            }],
            credits: {
                enabled: false
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                style: {
                    color: 'white'
                },
                formatter: function() {
                    return `<b>${this.x}</b><br/>用電量: ${this.y.toFixed(1)} kWh`;
                }
            }
        });

        // 找出高峰時段
        const maxIndex = peakData.indexOf(Math.max(...peakData));
        const peakHour = `${maxIndex}:00 - ${maxIndex + 1}:00`;
        const peakConsumption = Math.max(...peakData).toFixed(1);

        document.getElementById('peakHour').textContent = peakHour;
        document.getElementById('peakConsumption').textContent = `${peakConsumption} kWh`;
    }

    startRealTimeUpdates() {
        // 模擬即時數據更新
        setInterval(() => {
            // 隨機微調用電量數據
            Object.keys(this.appliances).forEach(deviceId => {
                const device = this.appliances[deviceId];
                if (device.status) {
                    // 隨機變化 ±5%
                    const variation = (Math.random() - 0.5) * 0.1;
                    const basePower = {
                        aircon: 850,
                        light: 120,
                        tv: 200,
                        fridge: 300,
                        washing: 450,
                        dishwasher: 600
                    }[deviceId];
                    
                    device.power = Math.round(basePower * (1 + variation));
                    
                    // 更新顯示
                    const powerUsageElement = document.querySelector(`[data-device="${deviceId}"] .power-usage`);
                    if (powerUsageElement) {
                        powerUsageElement.textContent = `${device.power}W`;
                    }
                }
            });

            this.updateRealtimeInfo();
        }, 5000); // 每5秒更新一次

        // 模擬設備自動開關
        setInterval(() => {
            // 隨機選擇一個設備進行狀態變更（低機率）
            if (Math.random() < 0.1) { // 10% 機率
                const deviceIds = Object.keys(this.appliances);
                const randomDeviceId = deviceIds[Math.floor(Math.random() * deviceIds.length)];
                
                // 只自動變更洗衣機和洗碗機（模擬自動完成）
                if (['washing', 'dishwasher'].includes(randomDeviceId)) {
                    const device = this.appliances[randomDeviceId];
                    if (device.status) {
                        // 自動關閉
                        const toggle = document.getElementById(`${randomDeviceId}-toggle`);
                        if (toggle) {
                            toggle.checked = false;
                            this.toggleDevice(randomDeviceId, false);
                        }
                    }
                }
            }
        }, 30000); // 每30秒檢查一次
    }
}

// 頁面載入完成後初始化儀表板
document.addEventListener('DOMContentLoaded', () => {
    new SmartHomeDashboard();
});

// 添加一些額外的互動效果
document.addEventListener('DOMContentLoaded', () => {
    // 為卡片添加點擊效果
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });

    // 為家電項目添加點擊動畫
    document.querySelectorAll('.appliance-item').forEach(item => {
        item.addEventListener('click', () => {
            item.style.transform = 'scale(0.98)';
            setTimeout(() => {
                item.style.transform = 'scale(1)';
            }, 150);
        });
    });
}); 