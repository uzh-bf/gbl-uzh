import { Dialog, Transition } from '@headlessui/react'
import { push } from '@socialgouv/matomo-next'
import { useState } from 'react'
import Button from './common/Button'

function Advisor() {
  const [isAdvisorActive, setIsAdvisorActive] = useState(false)

  return (
    <div>
      <Button
        className="mt-4"
        onClick={() => {
          setIsAdvisorActive(true)
          push(['trackEvent', 'GBL Advisor', 'Opened'])
        }}
      >
        <Button.Arrow />
        <div className="ml-2">Open</div>
      </Button>

      <Transition
        show={isAdvisorActive}
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <Dialog
          onClose={() => {
            setIsAdvisorActive(false)
            push(['trackEvent', 'GBL Advisor', 'Closed'])
          }}
          className="fixed inset-0 z-10 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen">
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

            <div className="relative w-screen h-screen p-32">
              <div className="w-full h-full bg-white rounded">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.gbl.uzh.ch/advisor/Gamification Advisor.html"
                />
              </div>

              <Button
                onClick={() => {
                  setIsAdvisorActive(false)
                  push(['trackEvent', 'GBL Advisor', 'Closed'])
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}

export default Advisor
