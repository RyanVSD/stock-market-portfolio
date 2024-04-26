import numeral from 'numeral';

const utilities = {
  formatNumber: m => {
      return (m != null ? numeral(m).format('0,0.00') : "----")
  }
}

export default utilities;
