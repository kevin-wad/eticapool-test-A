 
 
        import PoolStatsHelper from './pool-stats-helper.js'
        import PeerHelper from './peer-helper.js'

 
    export default class APIHelper  {
    
        constructor(   ){
           
           
        }

        //http://localhost:3000/api/v1/somestuff
        static async handleApiRequest(request, poolConfig, mongoInterface){
            console.log('got api request', request.params )

            if(request.params['query'].toLowerCase() == 'overview'){

                //  var poolData = await PoolStatsHelper.getPoolData( poolConfig, mongoInterface )

                let poolStatus = await PoolStatsHelper.getPoolStatus( poolConfig, mongoInterface )
                
                return { poolStatus }
            }

            if(request.params['query'].toLowerCase() == 'poolrecords'){

                //  var poolData = await PoolStatsHelper.getPoolData( poolConfig, mongoInterface )

                let poolStatsRecords = await PeerHelper.getpoolStatsRecords( mongoInterface, 1 )
                
                return { poolStatsRecords }
            }


            return 'This is the API'
        }
    
         
    }