
import React, { useEffect, useState } from 'react'
import UserFooter from '../components/user/UserFooter';
import { useQueryParam } from "use-params-query";
import axios from "axios";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { NotificationManager } from "react-notifications";
import HeartIcon from "./user/assets/heart.svg";
import HeartBlankIcon from "./user/assets/heart-blank.svg";
import HeaderHome from '../components/HeaderHome'
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { ARBITRUM_NETWORK_ID, BSC_NETWORK_ID, chains, GNOSIS_NETWORK_ID, OPTIMISTIC_NETWORK_ID, POLYGON_NETWORK_ID } from '../smart-contract/chains_constants';
import { setNativePriceOnUSD, updateCampaigns, updateReferalAddress } from '../store/actions/auth.actions';
import { backendURL } from '../config';
import isEmpty from "../utilities/isEmpty";
const CampaignFactory = require("../smart-contract/build/CampaignFactory.json");
const Campaign = require("../smart-contract/build/Campaign.json");
const Category = require("../config").Category;

export default function Home() {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const ref = useQueryParam("ref");
  const regexForWallet = /^(0x[a-fA-F0-9]{40})$/gm;

  const chainId = useSelector(state => state.auth.currentChainId);
  const account = useSelector(state => state.auth.currentWallet);
  const globalWeb3 = useSelector(state => state.auth.globalWeb3);
  const nativePrices = useSelector(state => state.auth.nativePrice);

  const [dropdown, setDropdown] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [SummariesOfCampaigns, setSummariesOfCampaigns] = useState([]);
  const [copied, setCopied] = useState(false);
  const [searchingCategory, setSearchingCategory] = useState(undefined);
  const [searchingName, setSearchingName] = useState(undefined);
  const campaignsFromStore = useSelector(state => state.auth.campaigns);

  useEffect(() => {
    if(searchingName)
    {
      let filtered = [];
      filtered = campaignsFromStore.filter( item => item[5].includes(searchingName) === true);
      setSummariesOfCampaigns(filtered);
    }
    else{
      setSummariesOfCampaigns(campaignsFromStore);
    }
  }, [searchingName, campaignsFromStore])

  useEffect(() => {
    if(searchingCategory && searchingCategory !== "See All")
    {
      let filtered = [];
      filtered = campaignsFromStore.filter( item => item[11] === searchingCategory);
      setSummariesOfCampaigns(filtered);
    }
    else{
      setSummariesOfCampaigns(campaignsFromStore);
    }
  }, [searchingCategory, campaignsFromStore])

  const getNativePrice = async () => {
    let consideringChains = [BSC_NETWORK_ID, POLYGON_NETWORK_ID, OPTIMISTIC_NETWORK_ID, ARBITRUM_NETWORK_ID, GNOSIS_NETWORK_ID];
    
    for(let idx = 0; idx<consideringChains.length; idx++)
    {
      if(Number(consideringChains[idx]) === chainId && account && globalWeb3)
      {
        try {
          const factory = new globalWeb3.eth.Contract(
            CampaignFactory,
            chains[chainId?.toString()]?.factoryAddress
          );
          if(factory){
            let nativePri = await factory.methods.getNativePriceOnUSD("1000000000000000000").call();
            nativePri = nativePri? globalWeb3.utils.fromWei(nativePri.toString(), "ether") : 0;
            dispatch(setNativePriceOnUSD(chainId, Number(nativePri)));
            await axios({
              method: "post",
              url: `${backendURL}/api/nativePrices/set`,
              data: {
                chainId: chainId,
                price: nativePri
              }
            }).then((res) => {}).catch((err)=>{});
          }
        }catch(err)
        {
          dispatch(setNativePriceOnUSD(chainId, 0));          
        }
      }
      else{
        //get native price from DB
        await axios({
          method: "post",
          url: `${backendURL}/api/nativePrices/getOne`,
          data: {
            chainId: consideringChains[idx]
          }
        }).then((res) => {
          if (res.data && res.data.code === 0) {
            let pricesFromDB = res.data.data[0] || {};
            if(pricesFromDB.chainId && pricesFromDB.chainId === consideringChains[idx])
            {
              dispatch(setNativePriceOnUSD(consideringChains[idx], Number(pricesFromDB.price)));
            }
            else {    
              dispatch(setNativePriceOnUSD(consideringChains[idx], 0));
            }
          }
        }).catch((err)=>{
            dispatch(setNativePriceOnUSD(consideringChains[idx], 0));
        });
      }
    }
  }

  useEffect(() => {
    if (ref !== undefined) {
      let m; let correct = false;
      while ((m = regexForWallet.exec(ref)) !== null) {
        if (m.index === regexForWallet.lastIndex) {
          regexForWallet.lastIndex++;
        }
        if (m[0] === ref) {
          correct = true;
          dispatch(updateReferalAddress(ref));
        }
      }
      if (!correct) {
        // dispatch(updateReferalAddress("0x8E4BCCA94eE9ED539D9f1e033d9c949B8D7de6C6"));
      }
    } else {
      // dispatch(updateReferalAddress("0x8E4BCCA94eE9ED539D9f1e033d9c949B8D7de6C6"));
    }
  }, [ref])

  const getAllFromSmartContract = async () => {
    try {
      const factory = new globalWeb3.eth.Contract(
        CampaignFactory,
        chains[chainId?.toString()].factoryAddress
      );
      let summary = [], campais = [];
      if (factory) {
        campais = await factory.methods.getDeployedCampaigns().call();
        setCampaigns(campais);
        summary = await Promise.all(
          campais.map((campaign, i) =>
            new globalWeb3.eth.Contract(Campaign, campais[i]).methods.getSummary().call()
          )
        );

      }
      if (campais.length > 0) {
        await axios({
          method: "post",
          url: `${backendURL}/api/campaign/all`,
          data: {
            chainId: chainId
          }
        }).then((res) => {
          if (res.data && res.data.code === 0) 
          {
            let summaryFromDB = res.data.data || [];
            if (summaryFromDB.length > 0) 
            {
              for (let idx = 0; idx < summary.length; idx++) 
              {
                let found = summaryFromDB.find((item) => item.address == campais[idx]) || undefined;
                if (found) 
                {
                  summary[idx][1] = globalWeb3.utils.fromWei(summary[idx][1].toString(), "ether");
                  summary[idx][5] = found.name;
                  summary[idx][6] = found.description;
                  summary[idx][7] = found.imageURL;
                  summary[idx][9] = found.verified;
                  summary[idx][11] = found.category;
                  summary[idx][12] = found.likes;
                  summary[idx][13] = false;
                  summary[idx][14] = found._id;
                  summary[idx][15] = found.chainId;
                }
              }
            }
          }
        }).catch((err) => {
          console.error(err);
        });
        await axios({
          method: "post",
          url: `${backendURL}/api/likes/getAllLikedCampaigns`,
          data: {
            user: account || "",
            chainId: chainId || ""
          }
        }).then((res) => {
          if (res.data && res.data.code === 0) {
            let summaryFromDB = res.data.data || [];
            if (summaryFromDB.length > 0) {
              for (let idx = 0; idx < summary.length; idx++) {
                let found = summaryFromDB.find((item) => item.campaign.address == campais[idx]) || undefined;
                if (found) {
                  summary[idx][13] = found.value;
                }
              }
            }
            setSummariesOfCampaigns(summary);
            dispatch(updateCampaigns(summary));
          }
        }).catch((err) => {
          console.error(err);
        });
      }
    }
    catch (e) {
      console.error(e);
    }
  }

  const getAllFromDB = async () => {

    let summary = [], campais = [];
    await axios({
      method: "post",
      url: `${backendURL}/api/campaign/all`,
      data: {
      }
    }).then((res) => {
      if (res.data && res.data.code === 0) {
        let summaryFromDB = res.data.data || [];
        if (summaryFromDB.length > 0) {
          for (let idx = 0; idx < summaryFromDB.length; idx++) {
            let found = summaryFromDB[idx] || undefined;
            if (found) {
              let newObj = {
                5: found.name,
                6: found.description,
                7: found.imageURL,
                9: found.verified,
                11: found.category,
                1: found.raised,
                12: found.likes,
                13: false,
                14: found._id,
                15: found.chainId,                
              };
              summary[idx] = newObj;
              campais[idx] = found.address;
            }
          }
        }
        setCampaigns(campais);
      }
    }).catch((err) => {
      console.error(err);
    });
    await axios({
      method: "post",
      url: `${backendURL}/api/likes/getAllLikedCampaigns`,
      data: {
        user: account || "",
        chainId: chainId || ""
      }
    }).then((res) => {
      if (res.data && res.data.code === 0) {
        let summaryFromDB = res.data.data || [];
        if (summaryFromDB.length > 0) {
          for (let idx = 0; idx < summary.length; idx++) {
            let found = summaryFromDB.find((item) => item.campaign.address === campais[idx]) || undefined;
            if (found) {
              summary[idx][13] = found.value;
            }
          }
        }
        setSummariesOfCampaigns(summary);
        dispatch(updateCampaigns(summary));
      }
    }).catch((err) => {
      console.error(err);
    });
  }

  useEffect(() => {
    getNativePrice();
    if (account && chainId && globalWeb3) {
      getAllFromSmartContract();
    }
    else {
      getAllFromDB();
    }
  }, [account, chainId, globalWeb3])

  const onCopyAddress = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false)
    }, 1000);
  }
  
  const onClickFavorites = async (idonDB, val) => {
    if (globalWeb3 && account && chainId) {
      await axios({
        method: "post",
        url: `${backendURL}/api/likes/set`,
        data: {
          campaign: idonDB,
          user: account || "",
          value: val,
          chainId: chainId || ""
        }
      }).then((res) => {
        if (res.data && res.data.code === 0) {
          getAllFromSmartContract();
        }
      }).catch((err) => {
        console.error(err);
        if (err.code && err.code === 4100) NotificationManager.warning("Please unlock your wallet and try again.");
      });
    } else {
      NotificationManager.warning("Please connect your wallet.");
    }
  }

  const onClickDonate = (id) =>{    
    if(chainId && account && globalWeb3)
    {
      navigate(`/campaign/${id}`);
    }else{
      NotificationManager.warning("Please connect your wallet.");
    }
  }

  return (
    <div>
      <HeaderHome />
      <section className="banner py-0 md:py-4">
        <div className="container">
          <div className="left md:w-7/12 sm:w-9/12 w-full sm:pl-12 pl-6 pr-3">
            <h1 className="text-white mb-3 md:mb-5 text-lg sm:text-xl md:text-xl lg:text-4xl xl:text-4.5xl font-semibold">
              A layer 2 Give-To-Earn <br /> grant protocol created by <br /> you, for
              everyone.
            </h1>
            <NavLink
              to="/create-campaign"
              className="createbtn sm:px-4 px-2 text-xs sm:text-xs md:text-lg py-2 pb-3"
            >
              Create a grant
            </NavLink>
          </div>
        </div>
      </section>

      <section className="main-home py-5 pb-12">
        <div className="container">
          <div className="flex justify-between items-center mb-6">
            <h2 className='text-xl font-bold dark:text-gray-100'>Explore Grants</h2>
            <div className='hidden md:flex flex-wrap items-start'>
              <div class="relative  text-gray-600 focus-within:text-gray-400">
                <span class="absolute inset-y-0 left-0 flex items-center pl-2">
                  <button
                    class="p-1 focus:outline-none focus:shadow-outline"
                  >
                    <svg
                      fill="none"
                      stroke="#3FABB3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      viewBox="0 0 24 24"
                      class="w-6 h-6"
                    >
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </button>
                </span>
                <input
                  type="search"
                  name="q"
                  class="py-2 text-sm dark:text-white text-gray-900 bg-white dark:bg-gray-900 pl-10 focus:outline-none focus:bg-white focus:dark:text-white focus:text-gray-900 rounded-3xl"
                  placeholder="Search..."
                  autocomplete="off"
                  value={searchingName}
                  onChange={(e)=>{setSearchingName(e.target.value)}}
                />
              </div>
              <div className="relative">
                <button className="sm:ml-3 ml-0 py-2 px-6 text-md leading-5 text-slate-800 bg-gradient-secondary font-bold rounded-full dark:text-gray-100 flex items-center justify-between" type="button" 
                  onClick={() => { setDropdown(!dropdown) }}
                  // style={{ minWidth:"200px" }}
                >
                  { !searchingCategory? "See All":searchingCategory}
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></button>
                {/* <!-- Dropdown menu --> */}
                {dropdown ? <>
                  <div id="dropdown" className="absolute  top-12 right-0 z-10 bg-white divide-y divide-gray-100 rounded shadow w-44 dark:bg-gray-700">
                    <ul className="py-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefault"
                       style={{ overflowY:"scroll", maxHeight:"300px" }}
                    >
                      {Category.map((i, index) => (
                        <li key={index} onClick={() => { setSearchingCategory(i); setDropdown(!dropdown); }}>
                          <span className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">{i}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </> : ''}
              </div>
            </div>
          </div>
          <div className="md:hidden flex lg:flex-wrap md:flex-nowrap items-center my-10">
              <div class="relative  text-gray-600 focus-within:text-gray-400">
                <span class="absolute inset-y-0 left-0 flex items-center pl-2">
                  <button
                    class="p-1 focus:outline-none focus:shadow-outline"
                  >
                    <svg
                      fill="none"
                      stroke="#3FABB3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      viewBox="0 0 24 24"
                      class="w-6 h-6"
                    >
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </button>
                </span>
                <input
                  type="search"
                  name="q"
                  class="py-2 text-sm dark:text-white text-gray-900 bg-white dark:bg-gray-900 pl-10 focus:outline-none focus:bg-white focus:dark:text-white focus:text-gray-900 rounded-3xl"
                  placeholder="Search..."
                  autocomplete="off"
                  value={searchingName}
                  onChange={(e)=>{setSearchingName(e.target.value)}}
                />
              </div>
            <div className="overflow-hidden flex overflow-x-auto categoryWrap">
            {Category.map((i, index) => (
              <div className='px-2' key={index}>
                {/* <div className="block text-center py-2 px-4 sm:px-6 text-md leading-5 text-slate-800 bg-gradient-secondary font-bold rounded-full dark:text-gray-100 whitespace-nowrap">{i.name}</div> */}
                <button type="button"
                    // className="block text-center text-md leading-5 dark:text-slate-800  font-bold rounded-full text-gray-100 whitespace-nowrap"
                    className={
                      // i.active? 
                      "block text-center px-4 py-4 bg-gradient-secondary text-md leading-5 text-slate-800 font-bold rounded-full dark:text-gray-100 whitespace-nowrap mobFilterItem text-ellipsis overflow-hidden focus:bg-gradient-secondary"
                      // : 
                      // "block text-center text-md px-4 py-4 bg-white leading-5 text-slate-800 dark:text-gray-100  font-bold rounded-full  whitespace-nowrap mobFilterItem text-ellipsis overflow-hidden focus:bg-gradient-secondary"
                    }
                    onClick={() => { setSearchingCategory(i);}}
                  >
                    {i}
                </button>
              </div>
            ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-8 ">
            {SummariesOfCampaigns && SummariesOfCampaigns.length > 0 && SummariesOfCampaigns.map((data, index) => 
            (
                <div className='bg-white px-2 md:px-6 pt-4 md:pt-12 pb-8 campaignCard' style={{maxWidth:"400px"}} key={index} >
                  <div className="flex flex-wrap md:justify-between lg:justify-between align-items-center"
                    style={{ userSelect: "none", display:"flex", justifyContent:"space-between" }}
                  >
                    <h5 className='value text-lg'>{campaigns[index]?.toString()?.substring(0, 8) + "..."}</h5>
                    <div className='flex flex-row justify-between gap-3 align-items-center' style={{ marginRight:"3px" }}>
                      <div className='relative handcursor' style={{textAlign:"center"}} onClick={() => { onClickFavorites(data[14], !data[13]) }} >
                        <img src={data[13] === false ? HeartBlankIcon : HeartIcon} alt="" className='handcursor'                      
                          style={{ width: "28px", height: "28px", cursor: "pointer" }}
                        />
                        <span className={` absolute value text-md ${data[13] === false ? "handcursor text-slate-800":"handcursor text-gray-100"}`} style={{ top:"0rem", left:"0.5rem" }}>{data[12]}</span>
                      </div>
                      <CopyToClipboard text={`${window.location.origin}/campaign/${campaigns[index]}`} onCopy={onCopyAddress}>
                        <div style={{
                          display: "flex", flexWrap: "wrap", flexDirection: "row",
                          cursor: "pointer",
                          userSelect: "none"
                        }} >
                          <img src="/images/share-button-svgrepo-com.svg"
                            style={{
                              width: "16px",
                              height: "16px",
                              marginTop: "2px"
                            }} alt="tick"
                          />
                          {
                            copied ? <span className='text-blue' >Copied</span> : <span className='text-blue' >{" "}</span>
                          }
                        </div>
                      </CopyToClipboard>
                    </div>
                  </div>
                  <div className="image relative my-4 flex justify-center">
                    <img src={data[7]} alt="item" className="rounded-lg my-3 w-full" 
                      style={{ width:"348px", height:"200px"}}
                    />
                    {
                      data[9] === true ?
                        <img src="/images/tick.png" alt="tick" className='absolute right-5 top-5' />
                        : <></>
                    }
                  </div>
                  <div className="body">
                    <div className="flex flex-wrap justify-between">
                      <h4 className='text-blue text-sm title mb-3 '>{data[5]}</h4>
                      <button className='bg-blue-light small-text font-normal px-2 text-xs py-1 mr-1'>{data[11]}</button>
                    </div>
                    <p className='text-blue description mb-3'>{data[6]}</p>
                    <p className='para'>{"Raised"}</p>
                    <h6 className='content mb-5 mt-1 text-sm'>
                      {Number(data[1]?.toString() || "0").toFixed(3)}{" "}{chains[data[15]]?.nativeCurrency}
                      {
                        Number(nativePrices[data[15]])>0?
                        " ($"+(Number(nativePrices[data[15]]) * Number(data[1])).toFixed(3)+")"
                        :
                        ""
                      }
                    </h6>
                    <div onClick={() => {onClickDonate(campaigns[index])}} className="handCursor py-2 donatebtn px-4 md:px-12 text-md leading-5 text-black bg-gradient-secondary font-bold">
                      Donate
                    </div>
                  </div>
                </div>
              
            ))}
          </div>
        </div>
      </section>

      <UserFooter />

    </div>
  )
}
