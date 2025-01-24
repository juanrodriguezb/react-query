import { Link, useNavigate, useParams, useSubmit, redirect, useNavigation } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { fetchEvent, updateEvent, queryClient } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EditEvent() {
  const navigate = useNavigate();
  const { state } = useNavigation();
  const submit = useSubmit();
  const params = useParams();

  const { data, isError, error } = useQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => {
      fetchEvent({ signal, id: params.id });
    },
    staleTime: 10000
  });

  //! useMutate was comented because of use of react-router
  // const { mutate } = useMutation({
  //   mutationFn: updateEvent,
  //   onMutate: async (data) => {
  //     const newEvent = data.event;

  //     await queryClient.cancelQueries({ queryKey: ['events', params.id] });
  //     const prevEvent = queryClient.getQueryData(['events', params.id]);
  //     queryClient.setQueryData(['events', params.id], newEvent);

  //     return { prevEvent }
  //   },
  //   onError: (error, data, context) => {
  //     queryClient.setQueryData(['events', params.id], context.prevEvent);
  //   },
  //   onSettled: () => {
  //     queryClient.invalidateQueries(['events', params.id])
  //   }
  // })

  function handleSubmit(formData) {
    submit(formData, { method: 'PUT' });

    //! mutate was comented because of use of react-router
    // mutate({
    //   id: params.id,
    //   event: formData
    // });
    // navigate('../');
  }

  function handleClose() {
    navigate('../');
  }

  let content;

  if (isError) {
    content = <>
      <ErrorBlock title="Failed to load event." message={error.info?.message || "Failed to load event. Please check your inputs and try again later."} />
      <div className='form-actions'>
        <Link to="../" className='button'>
          Okay
        </Link>
      </div>
    </>
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        {state === 'submitting' ? <p>Sending data...</p> : (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Update
            </button>
          </>
        )}

      </EventForm>
    )
  }

  return (
    <Modal onClose={handleClose}>
      {content}
    </Modal>
  );
}

export function loader({ params }) {
  return queryClient.fetchQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id })
  });
}

export async function action({ request, params }) {
  const formData = await request.formData();
  const updateEventData = Object.fromEntries(formData);
  await updateEvent({ id: params.id, event: updateEventData });
  await queryClient.invalidateQueries(['events']);

  return redirect("../");
}