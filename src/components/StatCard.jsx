import React from 'react';
import './StatCard.css';

const StatCard = ({ icon: Icon, title, value, color, topBorderColor }) => {
  return (
    <div className="stat-card glass" style={{ borderTop: `4px solid ${topBorderColor}` }}>
      <div className="stat-icon-wrapper" style={{ backgroundColor: `${color}15`, color: color }}>
        {Icon && <Icon size={24} />}
      </div>
      <div className="stat-info">
        <h3 className="stat-title">{title}</h3>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
