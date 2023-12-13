//Libraries used in project
const http = require('http');

var {Resourcer} = require('./bin/resourcer.js');
module.exports = class VHPwebserver extends Resourcer{
  /**
   * 
   * @param {
   *   port:Number
   *   connectCB:Function
   *   resources:Object
   * } config 
   */
  constructor({
    port=4000,
    connectCB=()=>{return {success:true,msg:'Enjoy'}},
    resources=null
  }){
    super(resources)
    this.port = port; //save port
    this.server = http.createServer();//create server

    this.server.on('request',(req,res)=>{//handle headers =>
      if(req.rawHeaders['Sec-Fetch-Site']!='same-origin'){
        res.setHeader('Access-Control-Allow-Origin', '*');
      }
    });

    this.server.on('request',(req,res)=>{
      console.log('request -> ',req.url);
      this.getResource(req.url,res).then(answer=>{
        console.log('fullfilled -> ',req.url,answer);
      }).catch(err=>{console.error(err);});
    });

    this.connected = new Promise((resolve,reject)=>{
      this.server.listen(this.port,(err)=>{
        if(err){return resolve({success:false,msg:err});}
        else{
          console.log('Server Listening: ',this.port);
          return resolve(connectCB());
        }
      });
    })
  }

  //managing
  CHECKconns(){
    return new Promise((resolve,reject)=>{
      setTimeout(()=>{
        this.server.getConnections((err,count)=>{console.log('server',count);return this.CHECKconns()})
      },2000)
    });
  }
}
