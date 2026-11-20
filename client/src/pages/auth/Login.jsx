import { useState } from 'react';
import { BiSolidHandDown } from 'react-icons/bi';
import { FaArrowRight, FaKey, FaUser } from 'react-icons/fa';
import { IoLogoAndroid } from 'react-icons/io';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import clublogo from '../../assets/81club.png';
import { demoLoginUser, loginUser } from '../../redux/reducer/authReducer';
function Login() {
  const [formData, setFormData] = useState({
    userName: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onAuthSuccess = (payload) => {
    toast.success(payload.message || 'Login successful');
    // Login banner popup trigger (sirf success pe)
    sessionStorage.setItem('showLoginBanner', '1');
    window.dispatchEvent(new Event('login-success'));
    navigate('/');
  };

  const handleLogin = async (payload) => {
    if (submitting || demoLoading) return;
    setSubmitting(true);
    try {
      const response = await dispatch(loginUser(payload));

      if (response.payload?.success) {
        onAuthSuccess(response.payload);
      } else {
        toast.error(response.payload?.message || 'Login failed');
      }
    } catch {
      toast.error('Something went wrong, please try again');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    if (submitting || demoLoading) return;
    setDemoLoading(true);
    try {
      const response = await dispatch(demoLoginUser());
      if (response.payload?.success) {
        onAuthSuccess(response.payload);
      } else {
        toast.error(response.payload?.message || 'Demo login failed');
      }
    } catch {
      toast.error('Demo login failed, please try again');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className='flex h-screen w-screen flex-col bg-gradient-to-b from-[#0088CC] to-[#2C3E50]'>
      <div className='flex flex-1 flex-col items-center justify-center pb-18'>
        <div className='flex w-[350px] max-w-[90%] flex-col items-center justify-center'>
          <img
            src={clublogo}
            alt='logo'
            className='max-h-[70px] object-cover'
          />
          <div className='mt-4 flex w-full flex-col items-center gap-3 rounded border border-[#0088CC] bg-[#fff] px-2 py-1 shadow-[0_0_5px_#fff]'>
            <div className='text-[#0088CC]'>
              <h4 className='flex items-center justify-center gap-1 text-[22px] font-[400]'>
                Login
                <BiSolidHandDown className='mt-1 text-[22px] font-[400]' />
              </h4>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin(formData);
              }}
              className='flex w-full flex-col gap-3'
            >
              {/* Username Input */}
              <div className='flex w-full overflow-hidden rounded border border-[#ced4da]'>
                <input
                  type='text'
                  placeholder='Username'
                  value={formData.userName}
                  onChange={(e) =>
                    setFormData({ ...formData, userName: e.target.value })
                  }
                  className='flex-1 border-0 px-3 py-2 focus:border-[#0088CC] focus:outline-none'
                />
                <div className='flex items-center justify-center bg-[#e9ecef] px-3'>
                  <FaUser className='text-black' />
                </div>
              </div>

              {/* Password Input */}
              <div className='flex w-full overflow-hidden rounded border border-gray-300'>
                <input
                  type='password'
                  placeholder='Password'
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className='flex-1 border-0 px-3 py-2 focus:border-[#0088CC] focus:outline-none'
                />
                <div className='flex items-center justify-center bg-gray-100 px-3'>
                  <FaKey className='text-black' />
                </div>
              </div>

              {/* Login Button */}
              <button
                type='submit'
                disabled={submitting || demoLoading}
                className='flex w-full cursor-pointer items-center justify-center gap-2 rounded bg-[#0088CC] py-2 font-semibold text-white transition-colors hover:bg-[#0077b3] disabled:opacity-60'
              >
                {submitting ? 'Logging in...' : 'Login'}
                <FaArrowRight className='text-white' />
              </button>

              {/* Login with Demo ID Button */}
              <button
                type='button'
                onClick={handleDemoLogin}
                disabled={submitting || demoLoading}
                className='flex w-full cursor-pointer items-center justify-center gap-2 rounded bg-[#0088CC] py-2 font-semibold text-white transition-colors hover:bg-[#0077b3] disabled:opacity-60'
              >
                {demoLoading ? 'Logging in...' : 'Login with demo ID'}
                <FaArrowRight className='text-white' />
              </button>
            </form>

            {/* reCAPTCHA Disclaimer */}
            <p className='text-center text-[12px] leading-relaxed font-[400] text-black'>
              This site is protected by reCAPTCHA and the Google{' '}
              <a href='#' className='text-[#0088CC] underline'>
                Privacy Policy
              </a>{' '}
              and{' '}
              <a href='#' className='text-[#0088CC] underline'>
                Terms of Service
              </a>{' '}
              apply.
            </p>
            {/* Download APK Link */}
            <div className='flex cursor-pointer items-center justify-center gap-2 text-[#0088CC] hover:underline'>
              <IoLogoAndroid className='text-[#0088CC]' />
              <span className='font-medium text-[#0088CC]'>Download APK</span>
            </div>
          </div>
        </div>
      </div>
      <div className='bg-primary text-primary fixed right-0 bottom-0 left-0 flex flex-col items-center justify-center p-2 lg:flex-row'>
        <div className='lg:underline-none flex w-full items-center justify-center gap-2 text-[12px] font-bold underline lg:justify-start lg:text-[16px]'>
          <span className=''> Terms and Conditions </span>
          <span className=''> Responsible Gaming </span>
        </div>
        <div className='flex w-full items-center justify-center gap-2 lg:justify-start'>
          <h2 className='text-[20px] font-[700] lg:text-[24px]'>
            24X7 Support
          </h2>
        </div>
      </div>
    </div>
  );
}

export default Login;
