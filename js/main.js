// Document Base Template Functionality
function copyTemplate(button) {
    // Find the email template content in the same card
    const templateCard = button.closest('.template-card');
    const emailTemplate = templateCard.querySelector('.email-template');
    
    if (emailTemplate) {
        // Create a temporary textarea to copy the content
        const tempTextarea = document.createElement('textarea');
        tempTextarea.value = emailTemplate.textContent.trim();
        document.body.appendChild(tempTextarea);
        
        // Select and copy the content
        tempTextarea.select();
        tempTextarea.setSelectionRange(0, 99999); // For mobile devices
        
        try {
            document.execCommand('copy');
            
            // Visual feedback
            const originalText = button.innerHTML;
            button.innerHTML = '✅ Copied!';
            button.style.background = 'linear-gradient(135deg, #27ae60 0%, #229954 100%)';
            
            // Reset button after 2 seconds
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.background = 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)';
            }, 2000);
            
        } catch (err) {
            console.error('Failed to copy template: ', err);
            // Fallback notification
            alert('Template copied to clipboard!');
        }
        
        // Remove the temporary textarea
        document.body.removeChild(tempTextarea);
    }
}

// Add smooth scrolling for better UX
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scroll behavior to any internal links
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add animation when cards come into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all template cards
    const templateCards = document.querySelectorAll('.template-card');
    templateCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});