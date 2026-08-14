import { genderLabel, timeLabel } from '../../lib/profile'

export function ProfileSummary({
  profile,
  error,
  profileError,
  loading,
  onEdit,
  onFriend,
  onAsk,
}) {
  return (
    <div className="form profile-summary">
      <div className="form-block">
        <p className="form-block-title">저장된 정보</p>
        <p className="profile-summary-name">{profile.name}님의 사주</p>
        <dl className="profile-summary-list">
          <div>
            <dt>생년월일</dt>
            <dd>{String(profile.birth).replaceAll('-', '.')}</dd>
          </div>
          <div>
            <dt>태어난 시간</dt>
            <dd>{timeLabel(profile.birth_time)}</dd>
          </div>
          <div>
            <dt>성별</dt>
            <dd>{genderLabel(profile.gender)}</dd>
          </div>
          <div>
            <dt>달력</dt>
            <dd>{profile.calendar}</dd>
          </div>
        </dl>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {profileError && (
        <p className="form-error" role="alert">
          {profileError}
        </p>
      )}
      <div className="profile-modal-actions">
        <button type="button" className="auth-button" onClick={onEdit}>
          프로필 수정
        </button>
        <button type="button" className="auth-button" onClick={onFriend}>
          친구 사주 해보기
        </button>
        <button
          className="submit"
          type="button"
          disabled={loading}
          onClick={onAsk}
        >
          {loading ? '해석 중…' : '내 사주 보기'}
        </button>
      </div>
    </div>
  )
}
