import { NavLink } from "react-router-dom";
import Slider from "react-slick";

export default function Carousel() {
  const settings = {
    dots: false,
    infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 6000
  };

  return (
    <div >

    <Slider {...settings}>
      <div className=" b1 bg-no-repeat bg-cover sm:bg-contain md:bg-contain rounded-[20px] container md:rounded-[30px] bg-center w-full  py-10 md:py-10 lg:py-24">
        <div className="max-w-[60%] sm:max-w-[70%] md:max-w-[60%] lg:max-w-[55%] text-[#FAFAFA] pl-6 md:pl-10 lg:pl-12">
          <h1 className="font-bold text-sm  sm:text-base mb-3 md:text-2xl lg:text-4xl  md:mb-5">
            A Layer 2 crowdfunding platform created by you, for everyone.
          </h1>
          <NavLink
            to="/create-campaign"
            className="createbtn sm:px-4 px-2 text-xs sm:text-xs md:text-lg py-2 pb-3"
          >
            <span className="cs">Create a grant</span>
          </NavLink>
        </div>
      </div>
      <div className=" b2 bg-no-repeat bg-cover sm:bg-contain md:bg-contain rounded-[20px] container md:rounded-[30px] bg-center w-full  py-10 md:py-10 lg:py-24">
        <div className="max-w-[60%] sm:max-w-[70%] md:max-w-[60%] lg:max-w-[55%] text-[#FAFAFA] pl-6 md:pl-10 lg:pl-12">
          <h1 className="font-bold text-sm  sm:text-base mb-3 md:text-2xl lg:text-4xl  md:mb-5">
            Fund projects and ideas through the GiveStation Twitter bot.
          </h1>
          <div className="createbtn inline sm:px-4 px-2 text-xs sm:text-xs md:text-lg py-2 pb-3">
            <span className="cs">Coming Soon</span>
          </div>
        </div>
      </div>
      <div className=" b3 bg-no-repeat bg-cover sm:bg-contain md:bg-contain rounded-[20px] overflow-hidden container md:rounded-[30px] bg-center w-full  py-10 md:py-10 lg:py-24">
        <div className="max-w-[65%] sm:max-w-[70%] md:max-w-[65%] lg:max-w-[60%] text-[#FAFAFA] pl-6 md:pl-10 lg:pl-12">
          <h1 className="font-bold text-sm  sm:text-base mb-3 md:text-2xl lg:text-4xl  md:mb-5">
            Participate in a hackathon, or create your own hackathon on
            GiveStation.
          </h1>
          <div className="createbtn inline sm:px-4 px-2 text-xs sm:text-xs md:text-lg py-2 pb-3">
            <span className="cs">Coming Soon</span>
          </div>
        </div>
      </div>
    </Slider>
    </div>
  );
}
