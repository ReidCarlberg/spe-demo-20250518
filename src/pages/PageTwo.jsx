
const PageTwo = () => {
  return (
    <div className="page-container">
      <h1>Welcome to Page Two</h1>
      <p>This is the second page of our Vite application.</p>
      
      <div className="info-section">
        <h2>About This Project</h2>
        <p>
          This is a simple two-page application built with Vite and React.
          It demonstrates how to set up multiple pages with navigation in a modern web application.
        </p>
      </div>
      
      <div className="form-section">
        <h2>Contact Form</h2>
        <form className="contact-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input type="text" id="name" placeholder="Enter your name" />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" placeholder="Enter your email" />
          </div>
          
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea id="message" rows="5" placeholder="Enter your message"></textarea>
          </div>
          
          <button type="submit" className="submit-btn">Send Message</button>
        </form>
      </div>
    </div>
  );
};

export default PageTwo;
