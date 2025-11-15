import React from 'react';
import assignmentIcon from '../assets/icons/assignment.svg';
import quizIcon from '../assets/icons/quiz.svg';
import studyingIcon from '../assets/icons/studying.svg';
import cleanIcon from '../assets/icons/clean.svg';
import groupDiscussionIcon from '../assets/icons/group-discussion.svg';
import './InputComponents.css';

const ICON_OPTIONS = [
  { index: 0, name: 'Assignment', src: assignmentIcon },
  { index: 1, name: 'Quiz', src: quizIcon },
  { index: 2, name: 'Studying', src: studyingIcon },
  { index: 3, name: 'Clean', src: cleanIcon },
  { index: 4, name: 'Group Discussion', src: groupDiscussionIcon }
];

function IconSelector({ selectedIndex, onChange }) {
  return (
    <div className="icon-selector">
      {ICON_OPTIONS.map((icon) => (
        <div
          key={icon.index}
          className={`icon-swatch ${selectedIndex === icon.index ? 'selected' : ''}`}
          onClick={() => onChange(icon.index)}
        >
          <img src={icon.src} alt={icon.name} />
          <span>{icon.name}</span>
        </div>
      ))}
    </div>
  );
}

export default IconSelector;
