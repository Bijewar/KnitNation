import css from '../../style/chart.css'
const SizeChartModal = ({ onClose }) => {
    console.log('Rendering size chart modal...');
    return (
        <div className="modal">
          <button className="close-button" onClick={onClose}><img src="/close.png" alt="" /></button>

          <div className='img'> 

          <img className='sizes' src="/chart.png" alt="Size Chart" />

          </div>
        </div>
    );
  };
  
  export default SizeChartModal;
  