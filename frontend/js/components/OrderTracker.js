let currentOrder = null;

function OrderTracker(order) {
    const steps = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
    const currentStep = steps.indexOf(order.status);
    return `
        <div style="background: rgba(0,0,0,0.3); border-radius: 16px; padding: 1.5rem; margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between;">
                ${steps.map((step, idx) => `
                    <div style="text-align: center; flex: 1;">
                        <div style="width: 40px; height: 40px; background: ${idx <= currentStep ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.5rem;">
                            ${idx === 0 ? '📝' : idx === 1 ? '✅' : idx === 2 ? '🍳' : idx === 3 ? '🚚' : '🏠'}
                        </div>
                        <div style="font-size: 0.75rem;">${step.replace('_', ' ').toUpperCase()}</div>
                    </div>
                `).join('')}
            </div>
            <div style="text-align: center; margin-top: 1rem;">
                <p style="color: var(--text-muted);">${order.status === 'delivered' ? '🎉 Order Delivered!' : '⏳ Your order is being processed...'}</p>
            </div>
        </div>
    `;
}