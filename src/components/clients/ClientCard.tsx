import React from 'react';
import { Client } from '../../types/client';
import { Building2, Wallet, CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface ClientCardProps {
  client: Client;
  onContextMenu: (e: React.MouseEvent, client: Client) => void;
  onClientClick: (client: Client) => void;
  onToggleVisibility: (client: Client) => void;
  type: 'building' | 'deposit' | 'built';
}

export const ClientCard: React.FC<ClientCardProps> = ({
  client,
  onContextMenu,
  onClientClick,
  onToggleVisibility,
  type
}) => {
  const getStatusIcon = () => {
    switch (type) {
      case 'building':
        return <Building2 className="w-4 h-4 text-emerald-600" />;
      case 'deposit':
        return <Wallet className="w-4 h-4 text-amber-600" />;
      case 'built':
        return <CheckCircle2 className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusColors = () => {
    switch (type) {
      case 'building':
        return 'border-emerald-500 bg-emerald-100';
      case 'deposit':
        return 'border-amber-500 bg-amber-100';
      case 'built':
        return 'border-blue-500 bg-blue-100';
    }
  };

  const calculatePaymentProgress = () => {
    const totalPaid = client.deposit + client.firstPayment + 
                     client.secondPayment + client.thirdPayment + 
                     client.fourthPayment;
    const percentage = (totalPaid / client.totalAmount) * 100;
    return Math.min(Math.round(percentage), 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const isDeadlineNear = () => {
    if (type !== 'building') return false;
    
    const startDate = client.createdAt?.toDate() || new Date();
    const deadlineDate = new Date(startDate);
    deadlineDate.setDate(deadlineDate.getDate() + client.constructionDays);
    
    const now = new Date();
    const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysLeft <= 5;
  };

  const isDeadlinePassed = () => {
    if (type !== 'building') return false;
    
    const startDate = client.createdAt?.toDate() || new Date();
    const deadlineDate = new Date(startDate);
    deadlineDate.setDate(deadlineDate.getDate() + client.constructionDays);
    
    return new Date() > deadlineDate;
  };

  const getCardStyle = () => {
    let baseStyle = `bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 ${getStatusColors()}`;
    
    if (isDeadlinePassed() || isDeadlineNear()) {
      baseStyle += ' bg-red-50';
    }
    
    return baseStyle;
  };

  const paymentProgress = calculatePaymentProgress();

  return (
    <div
      className={getCardStyle()}
      onContextMenu={(e) => onContextMenu(e, client)}
      onClick={() => onClientClick(client)}
    >
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 min-w-0">
            {/* Статус и имя */}
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                type === 'building' ? 'bg-emerald-100' : 
                type === 'deposit' ? 'bg-amber-100' : 
                'bg-blue-100'
              }`}>
                {getStatusIcon()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-medium text-sm truncate ${isDeadlinePassed() || isDeadlineNear() ? 'text-red-600' : 'text-gray-900'}`}>
                    {client.lastName} {client.firstName}
                  </span>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {client.clientNumber}
                  </span>
                </div>
              </div>
            </div>

            {/* Контакты и адрес */}
            <div className="flex items-center gap-4 text-xs text-gray-500 min-w-0 flex-1">
              <span className="truncate flex-shrink-0">{client.phone}</span>
              <span className="truncate flex-1">{client.constructionAddress}</span>
            </div>

            {/* Прогресс и кнопка видимости */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${getProgressColor(paymentProgress)}`}
                    style={{ width: `${paymentProgress}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-700 w-8">
                  {paymentProgress}%
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisibility(client);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                title={client.isIconsVisible ? 'Скрыть иконки' : 'Показать иконки'}
              >
                {client.isIconsVisible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};