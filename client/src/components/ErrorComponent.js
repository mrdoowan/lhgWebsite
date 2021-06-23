import React from 'react';

// Error handling at its finest

export default function Error({ code, page = null }) {
  let errorMarkup = null;

  switch (code) {
    case 403:
      errorMarkup = (<p>ERROR 403: You do not have access to this page.</p>);
      break;
    case 404:
      errorMarkup = (<p>This {(page) ? (page) : ('page')} is not registered. Please check your spelling or URL.</p>);
      break;
    case 500:
      errorMarkup = (<p>ERROR 500: Internal Server Error. Please report to an Admin ASAP.</p>);
      break;
    default:
      errorMarkup = (<p>ERROR {code}: Please tell an Admin on how you found this error.</p>);
      break;
  }

  return (
    <div className="body">
      {errorMarkup}
    </div>
  );
}
