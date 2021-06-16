import React from "react";

// Error handling at its finest

export default function Error({ code, page=null }) {
    const errorMarkup =
        (code === 404) ? (<p>LHG does not have this {(page) ? (page) : ('page')} registered. Please check your spelling or URL.</p>) :  // 404 - URL Not found
        (code === 403) ? (<p>ERROR 403: You do not have access to this page.</p>) : // 403 - Forbidden
        (code === 500) ? (<p>ERROR 500: Internal Server Error. Please report to an Admin ASAP.</p>) : // 500 - Server Error
        (<p>ERROR {code}: Please tell an Admin on how you found this error.</p>);

    return (
        <div className="body">
            {errorMarkup}
        </div>
    )
}
