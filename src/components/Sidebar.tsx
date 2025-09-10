'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const getInitialTab = () => {
    if (pathname.includes('/main/my-assets')) return 'assets';
    if (pathname.includes('/main/my-wallet')) return 'wallet';
    return 'trade';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [pathname]);

  const menuItems = [
    {
      id: 'trade',
      label: 'Trade',
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto cursor-pointer"
        >
          <path
            d="M15.5736 8.32812C15.8339 8.06792 16.2559 8.06801 16.5163 8.32812C16.7766 8.58847 16.7766 9.01114 16.5163 9.27148L9.87174 15.916L12.3008 16.2031C12.6661 16.2466 12.9272 16.578 12.8841 16.9434C12.8408 17.309 12.5089 17.5707 12.1432 17.5273L8.35091 17.0781C8.09733 17.0481 7.88317 16.8754 7.79948 16.6341C7.71588 16.3928 7.77712 16.1252 7.95768 15.9447L15.5736 8.32812Z"
            fill="currentColor"
            className={`transition-colors duration-200 ${
              activeTab === 'trade' ? 'text-[#225FED]' : 'text-white group-hover:text-[#225FED]'
            }`}
          />
          <path
            d="M10.3561 4.67643L14.1491 5.1263C14.4026 5.15634 14.6168 5.3285 14.7005 5.56966C14.7841 5.81093 14.7229 6.0792 14.5423 6.25977L6.92643 13.8757C6.66613 14.1359 6.24409 14.1358 5.98372 13.8757C5.72337 13.6153 5.72337 13.1933 5.98372 12.9329L12.6283 6.28776L10.1992 6.00065C9.83379 5.95726 9.57276 5.62586 9.61588 5.26042C9.65926 4.89493 9.99062 4.63325 10.3561 4.67643Z"
            fill="currentColor"
            className={`transition-colors duration-200 ${
              activeTab === 'trade' ? 'text-[#225FED]' : 'text-white group-hover:text-[#225FED]'
            }`}
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M17.6667 1C19.5076 1 21 2.49238 21 4.33333V17.6667C21 19.5076 19.5076 21 17.6667 21H4.33333C2.49238 21 1 19.5076 1 17.6667V4.33333C1 2.49238 2.49238 1 4.33333 1H17.6667ZM4.33333 2.33333C3.22876 2.33333 2.33333 3.22876 2.33333 4.33333V17.6667C2.33333 18.7712 3.22876 19.6667 4.33333 19.6667H17.6667C18.7712 19.6667 19.6667 18.7712 19.6667 17.6667V4.33333C19.6667 3.22876 18.7712 2.33333 17.6667 2.33333H4.33333Z"
            fill="currentColor"
            className={`transition-colors duration-200 ${
              activeTab === 'trade' ? 'text-[#225FED]' : 'text-white group-hover:text-[#225FED]'
            }`}
          />
        </svg>
      ),
      route: '/main/trading',
    },
    {
      id: 'assets',
      label: 'My Assets',
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto cursor-pointer"
        >
          <g clipPath="url(#clip0_3460_2972)">
            <path
              d="M6.26703 1.44238C6.7732 1.22155 7.36256 1.45282 7.58344 1.95898C7.80385 2.46502 7.5728 3.05459 7.06683 3.27539C5.96895 3.75449 5.00468 4.49498 4.25922 5.43262C3.51387 6.37019 3.00974 7.47679 2.79047 8.6543C2.57133 9.83171 2.64347 11.0456 3.0014 12.1885C3.35942 13.3313 3.99258 14.369 4.84418 15.2109C5.69597 16.053 6.7411 16.6746 7.88812 17.0195C9.03506 17.3643 10.2494 17.4231 11.4243 17.1904C12.599 16.9577 13.6994 16.4404 14.6284 15.6846C15.5573 14.9285 16.2878 13.9557 16.7543 12.8525C16.9695 12.3439 17.5562 12.1062 18.0649 12.3213C18.5731 12.5366 18.8111 13.1234 18.5961 13.6318C18.0024 15.0358 17.0733 16.2731 15.8911 17.2354C14.7087 18.1976 13.3083 18.8562 11.8129 19.1523C10.3176 19.4485 8.77179 19.3735 7.31195 18.9346C5.85222 18.4956 4.52196 17.7054 3.43793 16.6338C2.35394 15.5621 1.54887 14.2407 1.0932 12.7861C0.637621 11.3314 0.545667 9.78672 0.824646 8.28809C1.1037 6.78953 1.74525 5.38171 2.69379 4.18848C3.64257 2.99512 4.86972 2.05215 6.26703 1.44238ZM10.0004 0.666992C11.2259 0.667054 12.4395 0.908945 13.5717 1.37793C14.704 1.84697 15.7334 2.5338 16.6 3.40039C17.4666 4.26702 18.1545 5.29645 18.6235 6.42871C19.0923 7.56081 19.3334 8.77466 19.3334 10C19.3332 10.5521 18.8855 10.9999 18.3334 11H10.0004C9.44826 11 9.00063 10.5521 9.00043 10V1.66699C9.00043 1.40183 9.10593 1.14749 9.2934 0.959961C9.48092 0.772523 9.73528 0.666992 10.0004 0.666992ZM11.0004 9H17.2641C17.1789 8.38113 17.0149 7.77404 16.7748 7.19434C16.4064 6.30473 15.8668 5.49536 15.186 4.81445C14.5051 4.13356 13.6957 3.59412 12.8061 3.22559C12.2263 2.98546 11.6194 2.82158 11.0004 2.73633V9Z"
              fill="currentColor"
              className={`transition-colors duration-200 ${
                activeTab === 'assets' ? 'text-[#225FED]' : 'text-white group-hover:text-[#225FED]'
              }`}
            />
          </g>
          <defs>
            <clipPath id="clip0_3460_2972">
              <rect width="20" height="20" fill="white" />
            </clipPath>
          </defs>
        </svg>
      ),
      route: '/main/my-assets',
    },
    // {
    //   id: "wallet",
    //   label: "My Wallet",
    //   icon: (
    //     <svg
    //       width="20"
    //       height="20"
    //       viewBox="0 0 22 22"
    //       fill="none"
    //       xmlns="http://www.w3.org/2000/svg"
    //       className="mx-auto cursor-pointer"
    //     >
    //       <path
    //         d="M16.8428 0.191895C18.0003 0.192147 18.947 1.12304 18.9473 2.26025V4.61865C19.5682 4.98055 19.9999 5.63185 20 6.39697V12.6021C20 13.3673 19.5683 14.0194 18.9473 14.3813V16.7388C18.9473 17.8762 18.0005 18.8069 16.8428 18.8071H2.10547C0.937034 18.8071 0 17.8763 0 16.7388V2.26025C0.000244876 1.12288 0.937187 0.191895 2.10547 0.191895H16.8428ZM2.10547 2.26025V16.7388H16.8428V14.6704H10.5264C9.36849 14.6704 8.4209 13.7396 8.4209 12.6021V6.39697C8.4211 5.25959 9.36861 4.32865 10.5264 4.32861H16.8428V2.26025H2.10547ZM10.5264 6.39697V12.6021H17.8945V6.39697H10.5264ZM15.6768 8.62061C16.3535 8.62061 16.9021 9.15989 16.9023 9.82471C16.9023 10.4897 16.3536 11.0288 15.6768 11.0288C14.9999 11.0288 14.4512 10.4897 14.4512 9.82471C14.4514 9.15992 15 8.62065 15.6768 8.62061Z"
    //         fill="currentColor"
    //         className={`transition-colors duration-200 ${
    //           activeTab === "wallet"
    //             ? "text-[#225FED]"
    //             : "text-white group-hover:text-[#225FED]"
    //         }`}
    //       />
    //     </svg>
    //   ),
    //   route: "/main/my-wallet",
    // },
  ];

  const handleTabClick = (id: string, route: string) => {
    setActiveTab(id);
    router.push(route);
  };

  return (
    <div className="w-[84px] min-h-screen bg-[#16171D] fixed top-10 left-0 z-40">
      <div className="ml-4 mt-[48px] text-white text-sm text-center space-y-[16px]">
        {menuItems.map((item) => (
          <div key={item.id} className="group cursor-pointer">
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`w-full p-[16px] box-border ${
                    activeTab === item.id
                      ? 'bg-black/12 rounded-l-[12px] border-r-4 border-[#225FED] pr-[46px]'
                      : 'rounded-l-[12px] group-hover:bg-black/12 pr-[50px]'
                  }`}
                  onClick={() => handleTabClick(item.id, item.route)}
                >
                  {item.icon}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  );
}
