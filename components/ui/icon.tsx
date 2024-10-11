import SolarAddCircleOutline from "~icons/solar/add-circle-outline";
import SolarAltArrowLeftOutline from "~icons/solar/alt-arrow-left-outline";
import SolarAltArrowRightOutline from "~icons/solar/alt-arrow-right-outline";
import SolarArrowLeftDownOutline from "~icons/solar/arrow-left-down-outline";
import SolarArrowRightUpOutline from "~icons/solar/arrow-right-up-outline";
import SolarCard2Outline from "~icons/solar/card-2-outline";
import SolarDownloadMinimalisticOutline from "~icons/solar/download-minimalistic-outline";
import SolarGraphUpOutline from "~icons/solar/graph-up-outline";
import SolarHomeSmileOutline from "~icons/solar/home-smile-outline";
import SolarInfoCircleOutline from "~icons/solar/info-circle-outline";
import SolarMenuDotsBold from "~icons/solar/menu-dots-bold";
import SolarRefreshOutline from "~icons/solar/refresh-outline";
import SolarSuitcaseLinear from "~icons/solar/suitcase-linear";

export const Icon = {
  home: { smile: { outline: SolarHomeSmileOutline } },
  suitcase: { outline: SolarSuitcaseLinear },
  graph: { up: { outline: SolarGraphUpOutline } },

  download: { minimalistic: { outline: SolarDownloadMinimalisticOutline } },
  add: { circle: { outline: SolarAddCircleOutline } },
  info: { circle: { outline: SolarInfoCircleOutline } },

  arrow: {
    alt: {
      left: {
        outline: SolarAltArrowLeftOutline,
        down: { outline: SolarArrowLeftDownOutline },
      },
      rigth: {
        outline: SolarAltArrowRightOutline,
        up: { outline: SolarArrowRightUpOutline },
      },
    },
  },
  refresh: { outline: SolarRefreshOutline },
  menu: { dots: { bold: SolarMenuDotsBold } },
  card: { 2: { outline: SolarCard2Outline } },
};
