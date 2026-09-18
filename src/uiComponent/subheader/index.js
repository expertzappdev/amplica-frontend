// Header.jsx
import React, { useState } from 'react';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

const Header = ({ tabs }) => {
  const [value, setValue] = useState(tabs[0]?.value);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className="TabMenu__TabWrapper-sc-8owevb-0 jfSAHT">
      <TabContext value={value}>
        <TabList onChange={handleChange} aria-label="lab API tabs example">
          {tabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </TabList>

        {tabs.map((tab) => (
          <TabPanel key={tab.value} value={tab.value}>
            {tab.component || null}
          </TabPanel>
        ))}
      </TabContext>
    </div>
  );
};

export default Header;
