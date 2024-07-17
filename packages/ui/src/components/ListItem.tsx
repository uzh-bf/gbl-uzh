// import Link from 'next/link'

// TODO(JJ):
// Discuss with RS if we should install next/link?

// function GameListItem(
//   index: number,
//   id: number,
//   link: string,
//   name: string,
//   activePeriodIx: number,
//   status?: string,
//   showId: boolean = false
// ) {
//   return (
//     <div className="flex w-96 border p-2" key={id}>
//       <div className="w-10 pr-2 text-right">{index}.</div>
//       <Link className="flex w-full flex-col justify-between" href={link}>
//         <div>{name}</div>
//         <div className="flex gap-x-4 text-sm">
//           {showId ?? <div className="w-10">Id: {id}</div>}
//           <div>Active period: {activePeriodIx}</div>
//           {status ?? <div>Status: {status}</div>}
//         </div>
//       </Link>
//     </div>
//   )
// }

// export default GameListItem
