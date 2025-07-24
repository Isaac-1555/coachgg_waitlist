// CoachGG Landing Page JavaScript

// Configuration
const API_BASE_URL = window.location.origin.includes('localhost') ? 
    'http://localhost:3001/api' : '/api';

// Waitlist data storage (fallback to localStorage if no backend)
let waitlistData = JSON.parse(localStorage.getItem('coachgg-waitlist') || '[]');
let waitlistCount = waitlistData.length;
let useBackend = false;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    checkBackendAvailability();
    initializeForm();
    initializeAnimations();
});

// Check if backend is available
async function checkBackendAvailability() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            useBackend = true;
            console.log('✅ Backend connected');
            await updateWaitlistCountFromBackend();
        } else {
            throw new Error('Backend not available');
        }
    } catch (error) {
        console.log('📱 Using client-side storage (backend not available)');
        useBackend = false;
        updateWaitlistCountFromLocal();
    }
}

// Update waitlist counter from backend
async function updateWaitlistCountFromBackend() {
    try {
        const response = await fetch(`${API_BASE_URL}/waitlist/count`);
        if (response.ok) {
            const data = await response.json();
            waitlistCount = data.count;
            updateWaitlistDisplay();
        }
    } catch (error) {
        console.error('Error fetching waitlist count:', error);
        updateWaitlistCountFromLocal();
    }
}

// Update waitlist counter from localStorage
function updateWaitlistCountFromLocal() {
    waitlistCount = waitlistData.length;
    updateWaitlistDisplay();
}

// Update the display
function updateWaitlistDisplay() {
    const countElement = document.getElementById('waitlist-count');
    if (countElement) {
        // Show the real count - honest and authentic
        const displayCount = waitlistCount;
        countElement.textContent = displayCount.toLocaleString();
        
        // Animate the number change
        countElement.style.transform = 'scale(1.1)';
        setTimeout(() => {
            countElement.style.transform = 'scale(1)';
        }, 200);
    }
}

// Smooth scroll to waitlist section
function scrollToWaitlist() {
    const waitlistSection = document.getElementById('waitlist');
    if (waitlistSection) {
        waitlistSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
        // Focus on email input after scroll
        setTimeout(() => {
            const emailInput = document.getElementById('email');
            if (emailInput) {
                emailInput.focus();
            }
        }, 800);
    }
}

// Initialize form handling
function initializeForm() {
    const form = document.getElementById('waitlistForm');
    const submitButton = document.getElementById('submitButton');
    const buttonText = submitButton.querySelector('.button-text');
    const loadingSpinner = submitButton.querySelector('.loading-spinner');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const email = formData.get('email');
        const gamertag = formData.get('gamertag');
        const primaryGame = formData.get('primaryGame');
        const consent = formData.get('consent');
        
        // Validate required fields
        if (!email || !consent) {
            showNotification('Please fill in all required fields and accept the privacy policy.', 'error');
            return;
        }
        
        // Validate email format
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }
        
        // Show loading state
        submitButton.disabled = true;
        buttonText.style.display = 'none';
        loadingSpinner.style.display = 'inline-block';
        
        let success = false;
        let entry = null;
        
        if (useBackend) {
            // Submit to backend
            try {
                const response = await fetch(`${API_BASE_URL}/waitlist/join`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        gamertag: gamertag || '',
                        primaryGame: primaryGame || '',
                        consent: true
                    })
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    success = true;
                    entry = {
                        id: result.id,
                        email: email,
                        gamertag: gamertag || '',
                        primaryGame: primaryGame || '',
                        timestamp: result.timestamp
                    };
                    
                    // Update counter from backend
                    await updateWaitlistCountFromBackend();
                } else {
                    throw new Error(result.error || 'Failed to join waitlist');
                }
            } catch (error) {
                console.error('Backend error:', error);
                showNotification(error.message || 'Failed to join waitlist. Please try again.', 'error');
            }
        } else {
            // Fallback to localStorage
            // Check if email already exists
            if (waitlistData.some(entry => entry.email.toLowerCase() === email.toLowerCase())) {
                showNotification('This email is already on the waitlist!', 'warning');
                submitButton.disabled = false;
                buttonText.style.display = 'inline-block';
                loadingSpinner.style.display = 'none';
                return;
            }
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Create waitlist entry
            entry = {
                id: Date.now(),
                email: email,
                gamertag: gamertag || '',
                primaryGame: primaryGame || '',
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                referrer: document.referrer || 'direct'
            };
            
            // Save to localStorage
            waitlistData.push(entry);
            localStorage.setItem('coachgg-waitlist', JSON.stringify(waitlistData));
            waitlistCount = waitlistData.length;
            updateWaitlistDisplay();
            success = true;
        }
        
        // Reset form state
        submitButton.disabled = false;
        buttonText.style.display = 'inline-block';
        loadingSpinner.style.display = 'none';
        
        if (success && entry) {
            // Show success message
            showSuccessMessage();
            
            // Reset form
            form.reset();
            
            // Track conversion
            trackWaitlistSignup(entry);
            
            // Show notification
            showNotification('Welcome to the CoachGG family! 🎮', 'success');
        }
    });
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show success message
function showSuccessMessage() {
    const form = document.getElementById('waitlistForm');
    const successMessage = document.getElementById('successMessage');
    
    form.style.display = 'none';
    successMessage.style.display = 'block';
    
    // Add entrance animation
    successMessage.style.opacity = '0';
    successMessage.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        successMessage.style.transition = 'all 0.5s ease';
        successMessage.style.opacity = '1';
        successMessage.style.transform = 'translateY(0)';
    }, 100);
    
    // Auto-hide after 10 seconds and show form again
    setTimeout(() => {
        successMessage.style.display = 'none';
        form.style.display = 'block';
    }, 10000);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        z-index: 3000;
        max-width: 400px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        border: 1px solid ${getNotificationBorderColor(type)};
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return '✓';
        case 'error': return '✕';
        case 'warning': return '⚠';
        default: return 'ℹ';
    }
}

function getNotificationColor(type) {
    switch(type) {
        case 'success': return 'linear-gradient(135deg, #39FF14, #2ECC40)';
        case 'error': return 'linear-gradient(135deg, #FF4444, #CC0000)';
        case 'warning': return 'linear-gradient(135deg, #FFB84D, #FF8C00)';
        default: return 'linear-gradient(135deg, #9B30FF, #7B2CBF)';
    }
}

function getNotificationBorderColor(type) {
    switch(type) {
        case 'success': return '#39FF14';
        case 'error': return '#FF4444';
        case 'warning': return '#FFB84D';
        default: return '#9B30FF';
    }
}

// Track waitlist signup (for analytics)
function trackWaitlistSignup(entry) {
    // In production, send to analytics service
    console.log('Waitlist signup tracked:', {
        email: entry.email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Mask email for privacy
        gamertag: entry.gamertag,
        primaryGame: entry.primaryGame,
        timestamp: entry.timestamp
    });
    
    // You could integrate with Google Analytics, Mixpanel, etc.
    // gtag('event', 'waitlist_signup', {
    //     'game': entry.primaryGame,
    //     'has_gamertag': !!entry.gamertag
    // });
}

// Modal functions
function openPrivacyModal() {
    document.getElementById('privacyModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function openTermsModal() {
    document.getElementById('termsModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
});

// Mobile menu toggle
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const toggle = document.querySelector('.mobile-menu-toggle');
    
    navLinks.classList.toggle('mobile-active');
    toggle.classList.toggle('active');
}

// Initialize animations and interactions
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .step, .pricing-card');
    animateElements.forEach(el => {
        observer.observe(el);
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
    });
    
    // Add CSS for animation
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        
        .mobile-active {
            display: flex !important;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: rgba(13, 13, 13, 0.98);
            backdrop-filter: blur(10px);
            padding: 2rem;
            border-top: 1px solid var(--color-accent);
        }
        
        .mobile-menu-toggle.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .mobile-menu-toggle.active span:nth-child(2) {
            opacity: 0;
        }
        
        .mobile-menu-toggle.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.25rem;
            cursor: pointer;
            padding: 0;
            margin-left: auto;
            opacity: 0.7;
            transition: opacity 0.2s ease;
        }
        
        .notification-close:hover {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
}

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.floating-card');
    
    parallaxElements.forEach((element, index) => {
        const speed = 0.5 + (index * 0.1);
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading states to buttons
document.querySelectorAll('button').forEach(button => {
    if (!button.classList.contains('submit-button')) {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    }
});

// Keyboard navigation for accessibility
document.addEventListener('keydown', function(e) {
    // Close modals with Escape key
    if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal[style*="block"]');
        openModals.forEach(modal => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    // Quick access to waitlist with 'W' key
    if (e.key.toLowerCase() === 'w' && !e.ctrlKey && !e.metaKey) {
        const activeElement = document.activeElement;
        if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
            scrollToWaitlist();
        }
    }
});

// Export waitlist data (for admin use)
function exportWaitlistData() {
    if (waitlistData.length === 0) {
        showNotification('No waitlist data to export.', 'warning');
        return;
    }
    
    // Create CSV content
    const headers = ['Email', 'Gamertag', 'Primary Game', 'Signup Date', 'Referrer'];
    const csvContent = [
        headers.join(','),
        ...waitlistData.map(entry => [
            entry.email,
            entry.gamertag || '',
            entry.primaryGame || '',
            new Date(entry.timestamp).toLocaleDateString(),
            entry.referrer || 'direct'
        ].join(','))
    ].join('\n');
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coachgg-waitlist-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification('Waitlist data exported successfully!', 'success');
}

// Admin panel (hidden, accessible via console)
window.coachggAdmin = {
    getWaitlistData: () => waitlistData,
    getWaitlistCount: () => waitlistCount,
    exportData: exportWaitlistData,
    clearWaitlist: () => {
        if (confirm('Are you sure you want to clear all waitlist data?')) {
            localStorage.removeItem('coachgg-waitlist');
            waitlistData = [];
            waitlistCount = 0;
            updateWaitlistDisplay();
            showNotification('Waitlist data cleared.', 'warning');
        }
    }
};

// Console welcome message
console.log(`
🎮 CoachGG Landing Page
📊 Waitlist Count: ${waitlistCount}
🔧 Admin Commands:
   - coachggAdmin.getWaitlistData()
   - coachggAdmin.exportData()
   - coachggAdmin.clearWaitlist()
`);