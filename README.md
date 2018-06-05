### What is this?

This downloads all of the UK constituency postcodes from https://www.doogal.co.uk/ElectoralConstituencies.php by using the source for that pase, parseing it, downloading all the dependant files and then putting them into ArangoDB documents with the document _key property as the postcode for easy lookup

### How do i run it

```bash
npm install
npm start DATABASEPASSWORD
```

### What it assumed

 * Expects a local ArangoDB instance on port 8529
 * Expects database 'dump' to exist
 * Expects use of the 'root' user with access to database 'dump' with DATABASEPASSWORD passed as argument 
 * Expects a collection called constituencyPostcodes to exist

### Something else

This this is badly written with some next level of callback hell... sorry.