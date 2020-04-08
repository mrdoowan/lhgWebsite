// This will be used for the back-end and interface with both APIs
// This calls on LHG's relational Stats DB

const express = require('express');
const app = express();

app.get('/api/customers', (req, res) => {
    const customers = [
        {id: 1, firstName: 'John', lastName: 'Doe'}, 
        {id: 2, firstName: 'Steve', lastName: 'Smith'}, 
        {id: 3, firstName: 'Mary', lastName: 'Swanson'}, 
    ]

    res.json(customers);
});

const port = 5000;

app.listen(port, () => console.log(`Stats server started on port ${port}`));