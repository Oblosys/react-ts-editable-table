import faker from 'faker'

import { IntegerInput } from './DemoInputs'
import { Editable, EditableTable, useEditableRows } from './lib/EditableTable'

import './DemoTable.css'

const sum = (ns: number[]) => ns.reduce((s, n) => s + n, 0)

interface User {
  username: string
  fullName: string
  credits: number
}

export const DemoTable = (): JSX.Element => {
  const {
    state: [editableRows, setEditableRows],
    setRows,
    mkUpdateRowCellByRowId,
    dirtyRows,
  } = useEditableRows<User, 'username'>('username', [
    { username: 'dan', fullName: 'Toucan Dan', credits: 10 },
    { username: 'dave', fullName: 'Chiquita Dave', credits: 80 },
    { username: 'truck', fullName: 'Truck Shepard', credits: 30 },
    { username: 'vader', fullName: 'Dark Vader', credits: 75 },
  ])

  const handleAddRow = () => {
    const firstName = faker.name.firstName()
    const lastName = faker.name.lastName()

    setRows([
      {
        username: faker.internet.userName(firstName, lastName),
        fullName: `${firstName} ${lastName}`,
        credits: Math.floor(Math.random() * 200),
      },
    ])
  }

  // A real-world handleSave can post the changes to a server and set the rows on success.
  const handleSave = () => setRows(dirtyRows.map((row) => row.current))

  const handleDeleteRow = (userToDelete: Editable<User>) =>
    setEditableRows((users) => users.filter(({ current: { username } }) => username !== userToDelete.current.username))

  const serverSideCredits = sum(editableRows.map((x) => x.pristine.credits))

  // Difference with server-side total due to edited rows.
  const deltaCredits = sum(dirtyRows.map((x) => x.current.credits - x.pristine.credits))

  return (
    <div>
      <h3>Demo table</h3>
      <div>
        Total credits: {serverSideCredits + deltaCredits}{' '}
        {deltaCredits !== 0 ? ' = ' + serverSideCredits + (deltaCredits > 0 ? '+' : '') + deltaCredits : ''}
      </div>
      <div className="table-stats">
        <input className="add-row-button" type="button" value="Add row" onClick={handleAddRow} />
        <input
          className="save-button"
          type="button"
          value="Save"
          disabled={dirtyRows.length === 0}
          onClick={handleSave}
        />
        Row count: {editableRows.length}, Modified: {dirtyRows.length}
      </div>

      <EditableTable<User, 'username'> // Type params can be inferred, but specifying them give more readable errors.
        className="demo-table"
        rowIdKey="username"
        editableRows={editableRows}
        mkUpdateRowCellByRowId={mkUpdateRowCellByRowId}
        renderRow={(renderedCells, isDirty) => <tr className={isDirty ? 'is-dirty' : undefined}>{renderedCells}</tr>}
        renderTable={(renderedHeaderRow, renderedRows) => (
          <table>
            <thead>
              <tr>{renderedHeaderRow}</tr>
            </thead>
            <tbody>{renderedRows}</tbody>
          </table>
        )}
        columns={[
          {
            title: 'Delete',
            renderMetaCell: (editableRow) => (
              <td
                className="delete-cell"
                role="img"
                aria-label="Delete row"
                onClick={() => handleDeleteRow(editableRow)}
              >
                ❌
              </td>
            ),
          },
          {
            key: 'username',
            title: 'Username',
            renderHeaderCell: (title) => <th className="username-column">{title}</th>,
          },
          {
            key: 'fullName',
            title: 'Full name',
            renderCell: ([fullname, setFullName], isDirty) => (
              <td>
                <input
                  className={isDirty ? 'is-dirty' : undefined}
                  type="text"
                  value={fullname}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </td>
            ),
          },
          {
            key: 'credits',
            title: 'Credits',
            renderHeaderCell: (title) => <th className="credits-column">{title}</th>,
            renderCell: (state, isDirty) => (
              <td>
                <IntegerInput stateRef={state} isDirty={isDirty} />
              </td>
            ),
          },
          {
            title: 'Undo',
            renderHeaderCell: (title) => <th className="undo-column">{title}</th>,
            renderMetaCell: (editableRow, isDirty) => (
              <td>
                {isDirty ? <input type="button" value="undo" onClick={() => setRows([editableRow.pristine])} /> : null}
              </td>
            ),
          },
        ]}
      />

      <h3>Debug</h3>
      <table className="debug-table">
        <thead>
          <tr>
            <th>row.current</th>
            <th>row.pristine</th>
            <th>row.isdirty</th>
          </tr>
        </thead>
        <tbody>
          {editableRows.map(({ isDirty, current, pristine }) => (
            <tr key={current.username}>
              <td>{JSON.stringify(current)}</td>
              <td>{JSON.stringify(pristine)}</td>
              <td>{JSON.stringify(isDirty)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DemoTable
