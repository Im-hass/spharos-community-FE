/* eslint-disable react/no-array-index-key */
import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import classNames from 'classnames/bind';

import styles from './appointmentForm.module.scss';
import { DownArrowIcon, CheckIcon } from '../assets/svg/index';
import Pagination from '../components/common/Pagination';
import Title from '../components/common/Title';
import ConfirmAlert from '../components/common/ConfirmAlert';

const cx = classNames.bind(styles);
const NUMBER = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const ALERT_DATA = {
  subTit: '아래의 정보로',
  tit: '예약하시겠습니까?',
  btnContent: '예약하기',
};

const ALERT_CHANGE_DATA = {
  subTit: '아래의 정보로',
  tit: '예약변경하시겠습니까?',
  btnContent: '예약변경',
};

function AppointmentForm() {
  const nameRef = useRef();
  const phoneRef = useRef();
  const location = useLocation();

  const userInfo = location.state.prevParams?.userInfo;
  const prevAppointmentInfo = location.state.prevParams?.prevAppointmentInfo;

  const [changeAppointmentInfo, setChangeAppointmentInfo] = useState({
    appointmentType: 'CALL',
    numberOfPeople: 1,
  });
  const [openAlert, setOpenAlert] = useState(false);
  const [appointmentInfo, setAppointmentInfo] = useState({
    name: '',
    phone: '',
    appointmentType: 'CALL',
    numberOfPeople: 1,
    appointmentDate: '',
    appointmentHour: 0,
    personalInformationCollectionAndUsageAgreement: false,
    privacyPolicyRead: false,
  });

  useEffect(() => {
    if (location.state.newParams)
      setChangeAppointmentInfo({
        ...changeAppointmentInfo,
        appointmentDate: location.state.newParams.date,
        appointmentHour: location.state.newParams.time,
      });
    if (location.state.date)
      setAppointmentInfo({
        ...appointmentInfo,
        appointmentDate: location.state.date,
        appointmentHour: location.state.time,
      });
  }, []);

  const inputChangeHandler = e => {
    const nameValue = nameRef.current.value;
    const phoneValue = phoneRef.current.value;

    if (e.target.id === 'name')
      setAppointmentInfo({ ...appointmentInfo, name: nameValue });
    else setAppointmentInfo({ ...appointmentInfo, phone: phoneValue });
  };

  const clickKindBtnHandler = e => {
    setAppointmentInfo({ ...appointmentInfo, appointmentType: e.target.name });
    if (userInfo)
      setChangeAppointmentInfo({
        ...changeAppointmentInfo,
        appointmentType: e.target.name,
      });
  };

  const peopleChangeHandler = e => {
    setAppointmentInfo({
      ...appointmentInfo,
      numberOfPeople: Number(e.target.value),
    });
    if (userInfo)
      setChangeAppointmentInfo({
        ...changeAppointmentInfo,
        numberOfPeople: Number(e.target.value),
      });
  };

  const termClickHandler = e => {
    const { id } = e.target;
    if (id === 'term1')
      setAppointmentInfo({
        ...appointmentInfo,
        personalInformationCollectionAndUsageAgreement:
          !appointmentInfo.personalInformationCollectionAndUsageAgreement,
      });
    else if (id === 'term2')
      setAppointmentInfo({
        ...appointmentInfo,
        privacyPolicyRead: !appointmentInfo.privacyPolicyRead,
      });
  };

  const isChangeAppointment = key => {
    let answer = false;
    if (prevAppointmentInfo[key] === appointmentInfo[key]) {
      if (key === 'appointmentType')
        setChangeAppointmentInfo(current => {
          const { appointmentType, ...rest } = current;
          return rest;
        });
      if (key === 'numberOfPeople')
        setChangeAppointmentInfo(current => {
          const { numberOfPeople, ...rest } = current;
          return rest;
        });
      answer = true;
    }
    return answer;
  };

  const submitHandler = e => {
    e.preventDefault();

    let allCheck = false;

    if (
      appointmentInfo.personalInformationCollectionAndUsageAgreement &&
      appointmentInfo.privacyPolicyRead
    ) {
      if (!userInfo) setOpenAlert(true);
      else allCheck = true;
    } else {
      toast.error('필수 동의를 체크해주세요.');
      allCheck = false;
    }

    if (allCheck && userInfo) {
      if (
        isChangeAppointment('appointmentType') &&
        isChangeAppointment('numberOfPeople') &&
        Object.keys(changeAppointmentInfo).length === 0
      )
        toast.error('기존 예약과 같습니다');
      else setOpenAlert(true);
    }
  };

  return (
    <>
      {openAlert && (
        <ConfirmAlert
          page={userInfo ? 'change' : 'create'}
          alertInfo={userInfo ? ALERT_CHANGE_DATA : ALERT_DATA}
          userInfo={userInfo}
          appointmentInfo={userInfo ? prevAppointmentInfo : appointmentInfo}
          changeAppointmentInfo={userInfo && changeAppointmentInfo}
          appointmentCode={userInfo && prevAppointmentInfo.appointmentCode}
          setOpenAlert={setOpenAlert}
        />
      )}
      <div className={cx('wrap')}>
        <Pagination pageNum={2} />
        <Title name={userInfo ? '예약변경' : '예약하기'} />
        <form onSubmit={submitHandler}>
          <div className={cx('name-wrap', 'input-wrap')}>
            <label htmlFor='name' className={cx('left')}>
              이름
            </label>
            <input
              type='text'
              id='name'
              placeholder={userInfo?.name}
              className={cx('right', 'input')}
              ref={nameRef}
              onChange={inputChangeHandler}
              disabled={userInfo}
              required
            />
          </div>
          <div className={cx('phone-wrap', 'input-wrap')}>
            <label htmlFor='phone' className={cx('left')}>
              연락처
            </label>
            <input
              type='tel'
              id='phone'
              placeholder={userInfo ? userInfo.phone : 'ex) 010-1234-5678'}
              className={cx('right', 'input')}
              ref={phoneRef}
              onChange={inputChangeHandler}
              disabled={userInfo}
              pattern='^\d{3}-\d{3,4}-\d{4}$'
              title='ex) 010-1234-5678'
              required
            />
          </div>
          <div className={cx('kind-wrap', 'input-wrap')}>
            <span className={cx('left')}>상담종류</span>
            <div className={cx('btn-wrap', 'right')}>
              <button
                type='button'
                className={cx(
                  appointmentInfo.appointmentType === 'CALL' ? 'active' : '',
                )}
                name='CALL'
                onClick={clickKindBtnHandler}
              >
                전화상담
              </button>
              <button
                type='button'
                className={cx(
                  appointmentInfo.appointmentType === 'VISIT' ? 'active' : '',
                )}
                name='VISIT'
                onClick={clickKindBtnHandler}
              >
                방문상담
              </button>
            </div>
          </div>
          <div className={cx('number-wrap', 'input-wrap')}>
            <label htmlFor='number' className={cx('left')}>
              상담인원
            </label>
            <select
              className={cx('right', 'input')}
              onChange={peopleChangeHandler}
            >
              {NUMBER.map((num, i) => (
                <option key={`num-${i}`} name={i}>
                  {num}
                </option>
              ))}
            </select>
            <DownArrowIcon className={cx('icon')} />
          </div>
          <div className={cx('terms-wrap')}>
            <div className={cx('term')}>
              <div className={cx('term-left')}>
                <div className={cx('checkbox-wrap')}>
                  <input
                    type='checkbox'
                    id='term1'
                    onClick={termClickHandler}
                    defaultChecked={
                      appointmentInfo.personalInformationCollectionAndUsageAgreement
                    }
                  />
                  <CheckIcon className={cx('icon')} />
                </div>
                <label htmlFor='term1'>
                  <span>(필수)</span> 개인정보 수집 및 이용 동의
                </label>
              </div>
              <button type='button'>상세</button>
            </div>
            <div className={cx('term')}>
              <div className={cx('term-left')}>
                <div className={cx('checkbox-wrap')}>
                  <input
                    type='checkbox'
                    id='term2'
                    onClick={termClickHandler}
                    defaultChecked={appointmentInfo.privacyPolicyRead}
                  />
                  <CheckIcon className={cx('icon')} />
                </div>
                <label htmlFor='term2'>
                  <span>(필수)</span> 개인정보 처리방침 읽음 여부
                </label>
              </div>
              <button type='button'>상세</button>
            </div>
          </div>
          <button type='submit' className={cx('submit-btn')}>
            {userInfo ? '예약변경' : '예약확정'}
          </button>
        </form>
      </div>
    </>
  );
}

export default AppointmentForm;
