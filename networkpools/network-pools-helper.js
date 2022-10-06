 
import https from 'https'

const API_INTERVAL = 1000*30 // thirty seconds 
 

import  cron from 'node-cron' 

  //perform this with a robust task runner  - bree  and /tasks folder 

  import PeerHelper from '../lib/util/peer-helper.js'


import LoggingHelper from '../lib/util/logging-helper.js'


export default class NetworkPools  {

  constructor(mongoInterface, poolConfig ){
  
    this.poolConfig=poolConfig;
    this.mongoInterface=mongoInterface;

  }
  
  init(){
    
    NetworkPools.scanNetworkNewPools(this.poolConfig,this.mongoInterface);

  }
  

   update(){

 

    cron.schedule('*/20 * * * * *', async function() {
       

      NetworkPools.scanNetworkNewPools(this.poolConfig,this.mongoInterface)


    }.bind(this));

 
  } 

  // run twice a day:
  static async scanNetworkNewPools(poolConfig,mongoInterface){
 

    let network_pools = await  mongoInterface.findAll('network_pools', {poolstatus: 1}  );
    let network_pools_ids = $arrayofpoolsids;

    for(let onepool of network_pools)
    {

      let queryurl = ''+onepool.url+'/getpools'
      let onepool_pools = await NetworkPools.httpRequestURL(queryurl) // https://www.onepool.com/getpools return objects with just pool name, pool_id and pool url fields

      for(let onenewpool of onepool_pools){

      // if pool not in db yet, save pool info in 'newpools_checker' table:
      if(!network_pools_ids.includes(onenewpool.pool_id)){

        var candidatepool = {
          name: onenewpool.name,
          networkid: onenewpool.networkid,
          url: onenewpool.url,
          Hashrate: 0,
          Nbminers: 0,
          status: 1,
        }

        // check name, networkid and url fields type string and max X characters

        await mongoInterface.insertOne('newpools_checker', candidatepool);

      }


      }

    }

  }



  // run twice a day:
  static async CheckNewPools(poolConfig,mongoInterface){
 

    let candidatepools = await  mongoInterface.findAll('newpools_checker', {}  );


    for(let checkingpool of candidatepools)
    {

      // Add filters and checkers


      await mongoInterface.insertOne('network_pools', checkingpool);

      
      await mongoInterface.findAndDeleteOne('newpools_checker', {_id : checkingpool._id } );


    }

  }




  
  // run every 10 minutes
  static async scanNetworkPoolsStat(poolConfig,mongoInterface){
 

    let network_pools = await  mongoInterface.findAll('network_pools', {poolstatus: 1}, {lastupdate:-1}, {limit:20}  );

    for(let onepool of network_pools)
    {

      let queryurl = ''+onepool.url+'/poolstats';
      let onepool_pools_stats = await NetworkPools.httpRequestURL(queryurl) // https://www.onepool.com/poolstats return objects with just pool Hashrate

      // updates network_pool
      await mongoInterface.updateOne('networkpools',{_id:onepool._id}, {Hashrate: onepool_pools_stats.Hashrate, nbminers:onepool_pools_stats.nbminers} )

      // transform onepool.addresses into an array of max 5 addresses

      for(let oneaddress of onepool.addresses)
    {

      let existingAddress = await mongoInterface.findOne('network_pools_address', {address: oneaddress})

      if(!existingAddress){
        await mongoInterface.insertOne('network_pools_address', { networkpool_id: onepool.networkpool_id, address: oneaddress});
      }

    }

    }

  }

  // run twice a day:
  static async scanNetworkPoolsMintAddresses(poolConfig,mongoInterface){
 

    let network_pools = await  mongoInterface.findAll('network_pools', {poolstatus: 1}, {lastupdate:-1}, {limit:20}  );

    for(let onepool of network_pools)
    {

      let queryurl = ''+onepool.url+'/poolmintaddresses';
      let onepool_pools_stats = await NetworkPools.httpRequestURL(queryurl) // https://www.onepool.com/poolstats return objects with just pool Hashrate

      // updates network_pool
      await mongoInterface.updateOne('networkpools',{_id:onepool._id}, {Hashrate: onepool_pools_stats.Hashrate, nbminers:onepool_pools_stats.nbminers} )

      // transform onepool.addresses into an array of max 5 addresses

      for(let oneaddress of onepool.addresses)
    {

      let existingAddress = await mongoInterface.findOne('network_pools_address', {address: oneaddress})

      if(!existingAddress){
        await mongoInterface.insertOne('network_pools_address', { networkpool_id: onepool.networkpool_id, address: oneaddress});
      }

    }

    }

  }






  static async httpRequestURL(get_request_uri){

    return new Promise(   (resolve, reject) => {
      https.get(get_request_uri, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
        data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {

          let parsedData = null

          try{
            parsedData = JSON.parse(data)
          }catch(e){
            console.error(e)
          }

           

          if(parsedData){
            resolve(parsedData)
          }else{
            reject(false)
          }

        //  resolve( JSON.parse(data) )
        });

        }).on("error", (err) => {
          reject(err)
      });

    })

  }



}
