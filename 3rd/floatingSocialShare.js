class floatingSocialShare {
    constructor(btnConfig = []) {
        this.btnConfig = btnConfig;
        this.init(btnConfig);
        this.showSocialButtons();
    }

    init() {
        const allSocialMedia = [
            {
                key: 'facebook',
                name: 'Share to facebook',
                color: '#3b5998',
                icon: 'fa fa-facebook-f',
                url: this.getFacebookUrl()
            },
            {
                key: 'whatsapp',
                name: 'Share via whatsapp',
                color: '#25d366',
                icon: 'fa fa-whatsapp',
                url: this.getWhatsAppUrl()
            },
            {
                key: 'twitter',
                name: 'Twitter',
                color: '#1da1f2',
                icon: 'fa fa-twitter',
                url: this.getTwitterUrl()
            },
            {
                key: 'email',
                name: 'Share via email',
                color: '#95d03a',
                icon: 'fa fa-envelope',
                url: this.getEmailUrl()
            },
            {
                key: 'copy',
                name: 'Copy',
                color: '#7d7d7d',
                icon: 'fa fa-link',
                url: this.getCopyUrl()
            }
        ];
        
        this.socialMedia = this.btnConfig.length > 0
            ? allSocialMedia.filter(btn => this.btnConfig.includes(btn.key))
            : allSocialMedia;
        
        // Create main floating button and social buttons container
        const floatingButtonDiv = document.createElement('div');
        this.socialButtonsDiv = document.createElement('div');

        // Apply styles to the main button container (positioned at the bottom-right)
        floatingButtonDiv.className = 'floating-social';
        this.applyStyles(floatingButtonDiv, {
            position: 'fixed',
            top: '50%',
            left: '0px',
            marginTop: (parseInt((this.socialMedia.length * 40)/2 * -1) + 'px'),
            zIndex: '10'
        });

        // Apply styles to the social buttons container (hidden initially)
        this.applyStyles(this.socialButtonsDiv, {
            display: 'none',
            flexDirection: 'column',
            gap: '2px'
        });

        // Create social media buttons (using Font Awesome icons)
        this.socialButtons = this.socialMedia.map((platform) => {
            const button = document.createElement('a');
            button.href = platform.url;
            button.target = '_blank';
            button.title = platform.name;
            this.applyStyles(button, {
                width: '32px',
                height: '32px',
                backgroundColor: platform.color,
                borderRadius: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                textDecoration: 'none',
                fontSize: '18px',
                opacity: '0', // Initially hidden
                transform: 'translateY(20px)',
                transition: 'all 0.25s ease'
            });

            // Create the Font Awesome icon inside the button
            const icon = document.createElement('i');
            icon.className = platform.icon; // Add the icon class
            button.appendChild(icon);

            button.addEventListener('mouseenter', () => {
                button.style.width = '64px';
            });

            button.addEventListener('mouseleave', () => {
                button.style.width = '32px';
            });
            
            if(platform.name === 'Copy') {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const href = e.currentTarget.getAttribute('href');
                    navigator.clipboard.writeText(decodeURIComponent(href)).then(() => {
                        this.showCopyToast('The URL has been copied!');
                    })
                    .catch(err => {
                        this.showCopyToast('Failed to copy url: ', err);
                    });
                });
            }

            // Close button functionality
            if (platform.name === 'Close') {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.hideSocialButtons();
                });
            }

            this.socialButtonsDiv.appendChild(button);
            return button;
        });

        // Append elements to the floating button container
        floatingButtonDiv.appendChild(this.socialButtonsDiv);
        document.body.appendChild(floatingButtonDiv);
    }

    showSocialButtons() {
        this.socialButtonsDiv.style.display = 'flex';
        this.socialButtons.forEach((button, index) => {
            setTimeout(() => {
                button.style.opacity = '1';
                button.style.transform = 'translateY(0)';
            }, index * 100); // Slight delay between each button
        });
    }
    
    showCopyToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;

        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#168de2',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '20px',
            fontSize: '14px',
            opacity: '0',
            pointerEvents: 'none',
            transition: 'opacity 0.4s ease',
            whiteSpace: 'nowrap',
            zIndex: '999'
        });

        document.body.appendChild(toast);
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 400);
        }, 2000);
    }

    applyStyles(element, styles) {
        for (const property in styles) {
            element.style[property] = styles[property];
        }
    }
    
    getFacebookUrl() {
        const pageURL = encodeURIComponent(window.location.href);
        return `https://www.facebook.com/sharer/sharer.php?u=${pageURL}`;
    }

    getWhatsAppUrl() {
        const pageURL = encodeURIComponent(window.location.href);
        const pageTitle = encodeURIComponent(document.title);
        return `https://wa.me/?text=${pageTitle}%20${pageURL}`;
    }

    getTwitterUrl() {
        const pageURL = encodeURIComponent(window.location.href);
        const pageTitle = encodeURIComponent(document.title);
        return `https://twitter.com/intent/tweet?text=${pageTitle}&url=${pageURL}`;
    }
    
    getEmailUrl() {
        const pageURL = encodeURIComponent(window.location.href);
        const pageTitle = encodeURIComponent(document.title);
        return `mailto:?subject=${pageTitle}&body=${pageURL}`;
    }
    
    getCopyUrl() {
        const pageURL = encodeURIComponent(window.location.href);
        return pageURL;
    }
}
