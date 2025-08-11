import React from 'react';

const BreadcrumbNavigation = ({ currentPath, onPathClick }) => {
  return (
    <div className="file-browser-path">
      <nav className="fb-breadcrumb" aria-label="Breadcrumb">
        {currentPath.map((pathItem, index) => {
          const isLast = index === currentPath.length - 1;
          return (
            <React.Fragment key={index}>
              {index > 0 && <span className="fb-sep">›</span>}
              {isLast ? (
                <span className="fb-current" aria-current="page">
                  {pathItem.name}
                </span>
              ) : (
                <button
                  type="button"
                  className="fb-link"
                  onClick={() => onPathClick(pathItem, index)}
                >
                  {pathItem.name}
                </button>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
};

export default BreadcrumbNavigation;
