import { createContext, useState, useEffect, useCallback, useContext } from "react";

export const ThemeContext = createContext();

// Define available themes with their configurations
const THEMES = {
  'spe-demo': {
    id: 'spe-demo',
    name: 'SPE Demo',
    appName: 'SPE Demo',
    introTitle: 'Introducing SharePoint Embedded',
    introText: 'SPE is an AI forward platform, the fastest way to build and scale modern apps that manage documents, delivering Copilot AI, Office collaboration, Purview compliance, and a whole lot more, all via easy-to-use APIs.',
    dashboardConfig: {
      quickActions: [
        'View Profile',
        'Account Settings',
        'Notifications'
      ],
      recentActivityType: 'general'
    },
    documentsConfig: {
      pageTitle: 'SharePoint Embedded Explorer',
      pageSubtitle: 'Manage your SPE containers and documents',
      createButtonText: 'Create New Container',
      containersHeadline: 'Your Containers'
    },
    explorerConfig: {
      pageTitle: 'SharePoint Embedded Explorer',
      pageSubtitle: 'Manage your SPE containers and documents',
      createButtonText: 'Create New Container',
      formTitle: 'Create New Container',
      containerNameLabel: 'Container Name',
      containersHeading: 'Your Containers'
    }
  },
  'contoso-audit': {
    id: 'contoso-audit',
    name: 'Contoso Audit',
    appName: 'Contoso Audit',
    introTitle: 'Corporate Financial Audit Platform',
    introText: 'Streamline your financial audit processes with AI-powered document analysis, automated compliance checks, and real-time collaboration. Our platform ensures regulatory compliance while providing comprehensive audit trails and risk assessment capabilities for enterprise-grade financial auditing.',
    dashboardConfig: {
      quickActions: [
        'Financial Reports',
        'Audit Trail',
        'Compliance Check',
        'Risk Assessment'
      ],
      recentActivityType: 'audit'
    },
    documentsConfig: {
      pageTitle: 'Corporate Audit Manager',
      pageSubtitle: 'Manage your audit projects and compliance documentation',
      createButtonText: 'Create New Audit Project',
      containersHeadline: 'Your Current Audit Projects'
    },
    explorerConfig: {
      pageTitle: 'Audit Project Manager',
      pageSubtitle: 'Manage your audit projects and financial documentation',
      createButtonText: 'Create New Audit Project',
      formTitle: 'Create New Audit Project',
      containerNameLabel: 'Audit Project Name',
      containersHeading: 'Your Current Audit Projects'
    }
  },
  'fabrikam-legal': {
    id: 'fabrikam-legal',
    name: 'Fabrikam Legal',
    appName: 'Fabrikam Legal',
    introTitle: 'Legal Document Management System',
    introText: 'Transform your legal practice with intelligent document management, case collaboration, and client portal access. Built with legal-grade security and compliance features, enabling seamless case management, contract review, and secure client communications all in one platform.',
    dashboardConfig: {
      quickActions: [
        'Case Files',
        'Legal Documents',
        'Client Portal',
        'Court Calendar'
      ],
      recentActivityType: 'legal'
    },
    documentsConfig: {
      pageTitle: 'Legal Matter Management',
      pageSubtitle: 'Manage your legal matters and case documentation',
      createButtonText: 'Create New Legal Matter',
      containersHeadline: 'Your Current Legal Matters'
    }
  },
  'northwind-insurance': {
    id: 'northwind-insurance',
    name: 'Northwind Insurance',
    appName: 'Northwind Insurance',
    introTitle: 'Insurance Claim Management Platform',
    introText: 'Streamline your insurance claim processing with intelligent document analysis, automated risk assessment, and real-time claim tracking. Our comprehensive platform provides end-to-end claim management capabilities, enabling faster settlements, improved customer satisfaction, and enhanced fraud detection for modern insurance operations.',
    dashboardConfig: {
      quickActions: [
        'New Claims',
        'Claim Reports',
        'Policy Lookup',
        'Fraud Detection'
      ],
      recentActivityType: 'insurance'
    },
    documentsConfig: {
      pageTitle: 'Claim Management System',
      pageSubtitle: 'Manage your insurance claims and policy documentation',
      createButtonText: 'Create New Claim',
      containersHeadline: 'Your Active Claims'
    }
  }
};

export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or default to 'spe-demo'
  const [currentThemeId, setCurrentThemeId] = useState(() => {
    return localStorage.getItem("app_theme") || "spe-demo";
  });

  // Get current theme object
  const currentTheme = THEMES[currentThemeId] || THEMES['spe-demo'];

  // Update localStorage when theme changes
  useEffect(() => {
    localStorage.setItem("app_theme", currentThemeId);
  }, [currentThemeId]);

  // Change theme function
  const changeTheme = useCallback((themeId) => {
    if (THEMES[themeId]) {
      setCurrentThemeId(themeId);
    }
  }, []);

  // Get all available themes
  const getAvailableThemes = useCallback(() => {
    return Object.values(THEMES);
  }, []);

  // Get dashboard content based on theme
  const getDashboardContent = useCallback(() => {
    const theme = THEMES[currentThemeId];
    
    const baseContent = {
      quickActions: theme.dashboardConfig.quickActions,
      welcomeMessage: `Welcome to Your ${theme.appName} Dashboard`,
      introTitle: theme.introTitle,
      introText: theme.introText
    };

    // Customize recent activities based on theme
    switch (theme.dashboardConfig.recentActivityType) {
      case 'audit':
        return {
          ...baseContent,
          recentActivities: [
            'Financial audit initiated',
            'Quarterly compliance review completed',
            'Risk assessment updated'
          ],
          cardDescription: 'Recent audit activities and compliance updates will appear here.'
        };
      case 'legal':
        return {
          ...baseContent,
          recentActivities: [
            'Case file #2024-001 updated',
            'Client consultation scheduled',
            'Legal document review completed'
          ],
          cardDescription: 'Recent legal activities and case updates will appear here.'
        };
      default:
        return {
          ...baseContent,
          recentActivities: [
            'Profile viewed',
            'Dashboard accessed',
            'Account settings updated'
          ],
          cardDescription: 'Your recent actions and activities will appear here.'
        };
    }
  }, [currentThemeId]);

  // Get documents page content based on theme
  const getDocumentsContent = useCallback(() => {
    const theme = THEMES[currentThemeId];
    return {
      pageTitle: theme.documentsConfig.pageTitle,
      pageSubtitle: theme.documentsConfig.pageSubtitle,
      createButtonText: theme.documentsConfig.createButtonText,
      containersHeadline: theme.documentsConfig.containersHeadline
    };
  }, [currentThemeId]);

  const value = {
    currentTheme,
    currentThemeId,
    changeTheme,
    getAvailableThemes,
    getDashboardContent,
    getDocumentsContent,
    appName: currentTheme.appName
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
