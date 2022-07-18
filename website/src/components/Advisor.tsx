import { Modal, Button } from '@uzh-bf/design-system'
import { push } from '@socialgouv/matomo-next'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'

function Advisor() {
  const [isAdvisorActive, setIsAdvisorActive] = useState(false)

  return (
    <Modal
      fullScreen
      title="GBL Advisory Wizard"
      open={isAdvisorActive}
      trigger={
        <Button
          className="mt-4"
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
