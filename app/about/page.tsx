import React from 'react';

export const metadata = {
  title: 'About ReTypst',
  description: 'Learn more about ReTypst, the self-hosted WebUI for Typst',
};

const AboutPage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-4">About ReTypst</h1>
      <p className="mb-6">
        ReTypst is a self-developed, self-hosted WebUI for Typst, offering a cost-effective alternative to paid on-premise solutions. The goal is to provide developers with accessible and efficient means to leverage the powerful features of the Typst compiler.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Using Typst</h2>
      <p className="mb-6">
        The Typst compiler, licensed under the Apache 2.0 license, is at the core of ReTypst. This license permits free use and redistribution of the software in both original and modified forms, as long as the conditions of the Apache 2.0 license are adhered to.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Licensing Information</h2>
      <p className="mb-6">
        ReTypst utilizes the Typst Compiler, an open-source project under the Apache 2.0 license. The complete license can be viewed <a href="http://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">here</a>.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Contact and Contributions</h2>
      <p>
        Feedback and suggestions to improve the application are always welcome. If you are interested in supporting the project or providing feedback, please do not hesitate to get in touch.
      </p>
    </div>
  );
};

export default AboutPage;