import { Mail, MapPin, MessageCircle, Phone, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import ChatBox from '../../chat/ChatBox';
import { contactInfo } from '../../../shared/config/site';

const contactActions = [
  {
    id: 'phone',
    label: 'Gọi điện',
    href: contactInfo.phoneHref,
    icon: Phone,
    className: 'bg-emerald-600 hover:bg-emerald-700',
  },
  {
    id: 'mail',
    label: 'Email',
    href: contactInfo.emailHref,
    icon: Mail,
    className: 'bg-rose-600 hover:bg-rose-700',
  },
  {
    id: 'map',
    label: 'Bản đồ',
    href: contactInfo.mapHref,
    icon: MapPin,
    className: 'bg-sky-600 hover:bg-sky-700',
    target: '_blank',
  },
];

export default function ChatyWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    document.body.style.overflow = showChat ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [showChat]);

  return (
    <>
      {showChat && (
        <div className="fixed inset-x-3 bottom-20 z-50 sm:inset-x-auto sm:left-6 sm:w-96">
          <ChatBox onClose={() => setShowChat(false)} />
        </div>
      )}

      <div className="fixed bottom-5 left-5 z-50">
        <button
          type="button"
          onClick={() => setShowChat((value) => !value)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-gold text-white shadow-soft transition hover:bg-brand-goldDark"
          aria-label={showChat ? 'Đóng chat' : 'Mở chat'}
        >
          {showChat ? <X size={23} /> : <MessageCircle size={24} />}
        </button>
      </div>

      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
        {isOpen && (
          <div className="flex flex-col gap-2">
            {contactActions.map((action) => {
              const Icon = action.icon;
              return (
                <a
                  key={action.id}
                  href={action.href}
                  target={action.target}
                  rel={action.target ? 'noreferrer' : undefined}
                  className={`group flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition ${action.className}`}
                  aria-label={action.label}
                  title={action.label}
                >
                  <Icon size={20} />
                </a>
              );
            })}
          </div>
        )}
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-ink text-white shadow-soft transition hover:bg-black"
          aria-label={isOpen ? 'Đóng menu liên hệ' : 'Mở menu liên hệ'}
        >
          {isOpen ? <X size={22} /> : <Plus size={24} />}
        </button>
      </div>
    </>
  );
}
