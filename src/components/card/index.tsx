import { h, FunctionComponent } from 'preact'
import styles from './index.module.scss'

const Card: FunctionComponent<{}> = ({ children }) => {
  return <div className={styles.card}>{children}</div>
}

export { Card }
