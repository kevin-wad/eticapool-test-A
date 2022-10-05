<template>

<div>



 
       <Navbar />
     

   <div class="section bg-slate-etica   ">
     <div class="w-container pt-8 text-gray-100">

       



       
      
            <h1 class="title text-lg text-gray-100">
              Mining Account List
            </h1>
            <h2 class=" ">
             
            </h2>

<p style="color:green;">Etica Mining pool is Active (Hashrates estimate updates about every 30 secs based on shares submited over last hour)</p>
<p style="color:white;">Etica mining pool is open and synced with Etica mainnet. Thanks for patience</p>

<!--<p style="color:yellow;"> Mining pool is down for few hours. </p>
                    <p style="color:green;"> Keep the miner on, it will mine again as soon as the pool has finished maintenance </p> -->
             <div class="whitespace-sm"></div>

 



     
  

      <div   class="box  background-secondary overflow-x-auto" style="  min-height:480px;">
        <div class='subtitle'> </div>
        <table class='table w-full'>

          <thead>
            <tr >
              <td class="px-1"> Miner # </td>

              <td class="px-1"> Eth Address </td>
              <td class="px-1"> Hash Rate (MH/s)</td>
             
              
              <td class="px-1"> Total Etica Earned </td>
              <!--<td class="px-1"> Tokens Awarded </td>-->
              <td class="px-1"> Etica Received </td>
              <td class="px-1"> Port </td>
            </tr>
          </thead>

          <tbody>

            <tr v-for="(item, index) in accountList">
              <td class="px-1" style="width: 100%;">  Miner {{ index }} </td>


                <td>
                      <a v-bind:href='"/profile/"+item.minerEthAddress' >
                        <span class="color-eticacyan">  {{ item.minerEthAddress }}  </span>
                      </a>
                </td>

                <td class="px-1"> {{ hashrateToMH(item.avgHashrate) }} </td>
              

                <td class="px-1"> {{ tokensRawToFormatted( item.alltimeTokenBalance,18) }}    </td>
              <!--<td class="px-1"> {{ tokensRawToFormatted( item.tokensAwarded,18 ) }}   </td>-->
              <td class="px-1"> {{ tokensRawToFormatted( item.tokensReceived,18 ) }}   </td>
              <td v-if="item.minerport == 8080" class="px-1" style="color:#9bca33;"> 8080 </td>
              <td v-if="item.minerport == 8081" class="px-1" style="color:orange;"> 8081 </td>
             
            </tr> 


          </tbody>
        </table>

      </div>





 


     </div>
   </div>

   


    

  <Footer/>

</div>
</template>


<script>
import Navbar from './components/Navbar.vue';
import AppPanel from './components/AppPanel.vue';
import VerticalNav from './components/VerticalNav.vue'
import Footer from './components/Footer.vue';
 

import SocketHelper from '../js/socket-helper'
import MathHelper from '../js/math-helper'

import web3utils from 'web3-utils'

export default {
  name: 'Accounts',
  props: [],
  components: {Navbar,AppPanel,VerticalNav,Footer},
  data() {
    return {
       
      accountList: [],
      shareList: []  
    }
  },
  created(){
    
     this.socketHelper = new SocketHelper()
    
     setInterval(this.pollSockets.bind(this),5000)


    this.socketsListener = this.socketHelper.initSocket()
    
    
    this.socketsListener.on('minerList', (data) => {               
       
         
          this.updateAccountList(data)

    });

        this.socketsListener.on('shareList', (data) => {               
       
         
          this.updateShareList(data)

    });


   this.pollSockets()

  },
  beforeDestroy(){
    this.socketsListener.removeAllListeners()
  },
  methods: {


      async updateAccountList(newList){
 
           this.accountList = newList 
    
         /* this.accountList.push({
            alltimeTokenBalance: 100,
            minerEthAddress: '0x000000',
            tokenBalance: 100000,
            tokensAwarded: 0

          } )*/

           console.log('this.accountList', this.accountList)

           this.accountList = this.accountList.filter(x => web3utils.isAddress( x.minerEthAddress ) )
  


          this.accountList.sort((a,b) => {return b.alltimeTokenBalance - a.alltimeTokenBalance})
        
      },
            async updateShareList(newList){
 
           this.shareList = newList;

           console.log('sharelist');
           console.log('sharelist is', this.shareList);

    
         /* this.accountList.push({
            alltimeTokenBalance: 100,
            minerEthAddress: '0x000000',
            tokenBalance: 100000,
            tokensAwarded: 0

          } )*/

           console.log('this.shareList', this.shareList);
        
      },
      pollSockets(){
       
          this.socketHelper.emitEvent( 'getMinerList'),
          this.socketHelper.emitEvent( 'getShareList')
      },
      hashrateToMH(hashrate){
         return MathHelper.rawAmountToFormatted( hashrate , 6 )
      },
      tokensRawToFormatted(rawAmount, decimals){
          return MathHelper.rawAmountToFormatted( rawAmount , decimals )
      }

  }
}
</script>
