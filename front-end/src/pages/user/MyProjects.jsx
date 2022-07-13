import React from "react";
import SampleProject from "./assets/sampleProject.svg";
import HeartIcon from "./assets/heart.svg";

const MyProjects = () => {
  return (
    <div>
      <div className="py-20 px-10 wholeWrapper">
        <div className="flex items-center pageHead">
          <h1 className="text-white font-bold overview">My Projects</h1>
          <div className="accountNo ml-7">
            <h2>0xdeswqes35derihi87987gjhge</h2>
          </div>
        </div>

        <div className="mt-14 flex justify-center items-center flex-col">
          <div className="flex projectCard">
            <img src={SampleProject} alt="" className="projectImg" />
            <div className="flex justify-center items-start flex-col">
              <div className="flex items-center">
                <h1 className="projectTitle">Casino Berilia</h1>
                <div className="tag">Active</div>
                <div className="tag">Verified</div>
              </div>

              <div className="flex justify-start items-end projectDetails">
                <h4 className="projectDesc">
                  225% up to AU$ 5,000 jhgfjjhghjkkkhgj jhjkkkkhhkjhjkljhjklk
                  hjkljhjlljkhklljklljklljk
                </h4>

                <div className="line" />

                <div className="flex flex-col w-1/3 projectDesc">
                  <div className="flex justify-between items-center mb-1">
                    <span>Minimum Contribution</span>
                    <p>$2.50</p>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span>Target</span>
                    <p>$22.50</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Raised</span>
                    <p>$3.000</p>
                  </div>
                </div>

                <div className="line ml-32 mr-5 line1" />

                <div className="flex justify-start items-start flex-col projectBtnsDiv">
                  <div className="flex">
                    <img src={HeartIcon} alt="" />
                    <div className="likeCount flex justify-center items-center">
                      48
                    </div>
                  </div>

                  <button className="updateBtn flex justify-center items-center ">
                    <p>Update</p>
                    <svg
                      width="6"
                      height="9"
                      viewBox="0 0 6 9"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1.5 7.5L4.5 4.5L1.5 1.5"
                        stroke="black"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer flex justify-center items-center">
        <img width={92} height={76} src="/images/logo.svg" alt="logo" />
        <h1 className="text-white font-bold text-xl ml-16">GiveDAO</h1>
        <h1 className="text-white font-bold text-xl ml-12">About</h1>
        <h1 className="text-white font-bold text-xl ml-12">How it works</h1>
      </div>
    </div>
  );
};

export default MyProjects;