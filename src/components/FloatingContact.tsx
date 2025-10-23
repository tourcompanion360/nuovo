import React, { useState } from 'react';
import { MessageCircle, Mail, X, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FloatingContact = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const contactOptions = [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageCircle,
      color: 'from-green-500 to-green-600',
      action: () => {
        const phoneNumber = '393293763839'; // +39 329 376 3839
        const whatsappUrl = `https://wa.me/${phoneNumber}`;
        window.open(whatsappUrl, '_blank');
      }
    },
    {
      id: 'email',
      label: 'Email',
      icon: Mail,
      color: 'from-blue-500 to-blue-600',
      action: () => {
        const email = 'prismatica360@gmail.com';
        const subject = 'Richiesta informazioni CRM';
        const body = '';
        const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoUrl;
      }
    }
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-8 left-8 z-40">
      {/* Contact Options */}
      <div className={`absolute bottom-20 left-0 flex flex-col gap-3 transition-all duration-300 ease-out ${
        isOpen 
          ? 'opacity-100 translate-y-0 pointer-events-auto' 
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        {contactOptions.map((option, index) => {
          const Icon = option.icon;
          return (
            <div
              key={option.id}
              className="flex items-center justify-start gap-3"
              style={{ 
                transform: isOpen ? 'translateX(0)' : 'translateX(-20px)',
                transition: `all 0.3s ease-out ${index * 0.1}s`
              }}
            >
              {/* Label */}
              <div className="bg-background border border-border rounded-lg px-3 py-2 shadow-lg backdrop-blur-sm">
                <span className="text-sm font-medium text-foreground whitespace-nowrap">
                  {option.label}
                </span>
              </div>
              
              {/* Button */}
              <button
                onClick={option.action}
                className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg hover:scale-105 transition-all duration-200 ${
                  option.id === 'whatsapp' ? 'bg-green-500 hover:bg-green-600' :
                  'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                <Icon size={18} className="text-white" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Main Floating Button */}
      <button
        onClick={toggleMenu}
        className={`w-14 h-14 rounded-full bg-primary hover:bg-primary-hover shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
      >
        {isOpen ? (
          <X size={20} className="text-primary-foreground" />
        ) : (
          <MessageCircle size={20} className="text-primary-foreground" />
        )}
      </button>

      {/* Backdrop when open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/10 -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default FloatingContact;