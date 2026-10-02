import React from 'react';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from './components/Tabs';
import { Accordion, AccordionItem, AccordionHeader, AccordionPanel } from './components/Accordion';

function App() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Compound Components Pattern Demo</h1>
      
      <section style={{ marginBottom: '40px' }}>
        <h2>Tabs Component</h2>
        <Tabs defaultActiveTab={0}>
          <TabList>
            <Tab>Profile</Tab>
            <Tab>Settings</Tab>
            <Tab>Billing</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <h3>Profile Info</h3>
              <p>Welcome to your profile. This component shows the clean structure of the compound components pattern where child components share state.</p>
            </TabPanel>
            <TabPanel>
              <h3>Settings</h3>
              <p>Manage your account settings here.</p>
            </TabPanel>
            <TabPanel>
              <h3>Billing</h3>
              <p>View your billing history.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </section>

      <section>
        <h2>Accordion Component</h2>
        <Accordion defaultActiveIndex={0}>
          <AccordionItem>
            <AccordionHeader>What is the Compound Component Pattern?</AccordionHeader>
            <AccordionPanel>
              <p>It's a pattern where multiple components are used together to share state and handle behavior implicitly. It avoids prop drilling and creates an expressive API.</p>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionHeader>Why use it?</AccordionHeader>
            <AccordionPanel>
              <p>It allows consumers of the component to easily change the order of children or insert other markup without breaking the component's internal functionality.</p>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionHeader>How does it work under the hood?</AccordionHeader>
            <AccordionPanel>
              <p>It uses React Context to share state between the parent wrapper component and its child components.</p>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  );
}

export default App;
