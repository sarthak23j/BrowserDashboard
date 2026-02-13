import React, { useState, useEffect, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../Styles/Clock.css';

const Clock = () => {
  const [time, setTime] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const clockRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (clockRef.current && !clockRef.current.contains(event.target)) {
        setIsPinned(false);
        setShowCalendar(false);
      }
    };

    if (isPinned) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPinned]);

  const formatTimeParts = (date) => {
    const formatter = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const parts = formatter.formatToParts(date);
    const time = parts.filter(p => p.type !== 'dayPeriod').map(p => p.value).join('').trim();
    const period = parts.find(p => p.type === 'dayPeriod')?.value || '';
    return { time, period };
  };

  const formatDateParts = (date) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(date);
    
    const weekday = parts.find(p => p.type === 'weekday')?.value || '';
    const month = parts.find(p => p.type === 'month')?.value || '';
    const day = parts.find(p => p.type === 'day')?.value || '';
    
    return { weekday, month, day };
  };

  const { time: formattedTime, period } = formatTimeParts(time);
  const { weekday, month, day } = formatDateParts(time);

  const handleMouseEnter = () => setShowCalendar(true);
  const handleMouseLeave = () => {
    if (!isPinned) setShowCalendar(false);
  };

  const togglePin = (e) => {
    e.stopPropagation();
    setIsPinned(!isPinned);
  };

  return (
    <div 
      ref={clockRef}
      className={`clock-container ${isPinned ? 'pinned' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={togglePin}
    >
      <div className="time">
        {formattedTime}
        <span className="am-pm">{period}</span>
      </div>
      <div className="date">
        <span className="weekday">{weekday}</span><span className="date-text">, {month} {day}</span>
      </div>
      {(showCalendar || isPinned) && (
        <div className="calendar-popup" onClick={(e) => e.stopPropagation()}>
          <Calendar 
            value={time} 
            calendarType="gregory"
            view="month"
            onClickDay={(value, event) => event.preventDefault()} // Disable date clicks
          />
        </div>
      )}
    </div>
  );
};

export default Clock;
