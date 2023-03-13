import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { push } from '@socialgouv/matomo-next'
import { Button, Modal } from '@uzh-bf/design-system'
import { useState } from 'react'

function Advisor() {
  const [isAdvisorActive, setIsAdvisorActive] = useState(false)

  return (
    <Modal
      fullScreen
      open={isAdvisorActive}
      trigger={
        <Button
          className={{ root: 'mt-4' }}
          onClick={() => {
            setIsAdvisorActive(true)
            push(['trackEvent', 'GBL Advisor', 'Opened'])
          }}
        >
          <Button.Icon>
            <FontAwesomeIcon icon={faArrowRight} />
          </Button.Icon>
          <Button.Label>Start Advisor</Button.Label>
        </Button>
      }
      onClose={() => {
        setIsAdvisorActive(false)
        push(['trackEvent', 'GBL Advisor', 'Closed'])
      }}
    >
      <iframe
        width="100%"
        height="100%"
        src="https://www.gbl.uzh.ch/advisor/Gamification Advisor.html"
      />
    </Modal>
  )
}

export default Advisor
