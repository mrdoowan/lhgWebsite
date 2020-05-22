import React from "react";

// Error handling at its finest

export default function Error({ code, page=null }) {
    let errorMarkup = 
        (code === 404) ? (<p>ERROR 404: Path Not Found.</p>) :  // 404 - URL Not found
        (code === 500) ? (<p>ERROR 500: Internal Server Error</p>) : // 500 - Server Error
        (code === 400) ? (<p>LHG does not have this {(page) ? (page + ' ') : ''}registered. Please check your spelling.</p>) : // 400 - Bad Request
        (<p>ERROR {code}: Please tell an Admin on how you found this error.</p>);

    return (
        <div className="body">
            {errorMarkup}
        </div>
    )
}