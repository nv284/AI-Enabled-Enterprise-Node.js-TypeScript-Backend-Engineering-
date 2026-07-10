import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
const app=express();
const spec=YAML.load('./openapi/openapi.yaml');
app.use('/docs',swaggerUi.serve,swaggerUi.setup(spec));
app.get('/api/v1/students',(_,res)=>res.json([{id:1,name:'Alice'}]));
app.listen(3000,()=>console.log('Running http://localhost:3000'));
